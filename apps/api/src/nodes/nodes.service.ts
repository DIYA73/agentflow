import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as vm from 'node:vm';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { Resend } from 'resend';
import { FlowNode } from '../flows/entities/flow.entity';

const CODE_TIMEOUT_MS = 5000;

@Injectable()
export class NodesService {
  private readonly logger = new Logger(NodesService.name);
  private readonly openai: OpenAI;
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') });
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

  async execute(
    node: FlowNode,
    input: Record<string, unknown>,
    executionId: string,
  ): Promise<unknown> {
    const nodeType = ((node.data as Record<string, unknown>)?.type as string) || node.type;
    switch (nodeType) {
      case 'ai-llm':         return this.runAiLlm(node, input);
      case 'web-scraper':    return this.runWebScraper(node, input);
      case 'api-caller':     return this.runApiCaller(node, input);
      case 'code-runner':    return this.runCodeRunner(node, input);
      case 'email-sender':   return this.runEmailSender(node, input);
      case 'data-transform': return this.runDataTransform(node, input);
      case 'webhook-output': return this.runWebhookOutput(node, input);
      case 'condition':      return this.runCondition(node, input);
      default:
        throw new BadRequestException(`Unknown node type: ${nodeType}`);
    }
  }

  // ─── AI LLM Node ──────────────────────────────────────────
  private async runAiLlm(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { prompt, model = 'gpt-4o', systemPrompt } = (node.data.config || {}) as {
      prompt: string;
      model?: string;
      systemPrompt?: string;
    };

    if (!prompt) return { text: '[no prompt configured]', usage: null };

    const resolvedPrompt = this.interpolate(prompt, input);

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: resolvedPrompt });

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: 2000,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  }

  // ─── Web Scraper Node ─────────────────────────────────────
  private async runWebScraper(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { url, selector } = node.data.config as { url: string; selector?: string };
    const resolvedUrl = this.interpolate(url, input);

    const response = await fetch(resolvedUrl, {
      headers: { 'User-Agent': 'agentflow-scraper/1.0' },
    });

    if (!response.ok) throw new Error(`Scrape failed: HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const textContent = selector
      ? $(selector).text().replace(/\s+/g, ' ').trim()
      : $('body').text().replace(/\s+/g, ' ').trim();

    return { url: resolvedUrl, html, textContent, statusCode: response.status };
  }

  // ─── API Caller Node ──────────────────────────────────────
  private async runApiCaller(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { url, method = 'GET', headers = {}, body } = (node.data.config || {}) as {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    };

    if (!url) return { statusCode: 0, data: '[no url configured]', headers: {} };

    const resolvedUrl = this.interpolate(url, input);
    const resolvedBody = body ? this.interpolate(body, input) : undefined;

    const response = await fetch(resolvedUrl, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: resolvedBody,
    });

    let data: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { statusCode: response.status, data, headers: Object.fromEntries(response.headers) };
  }

  // ─── Code Runner Node ─────────────────────────────────────
  private async runCodeRunner(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { code } = node.data.config as { code: string };
    if (!code?.trim()) return { output: null };

    // NOTE: node:vm is NOT a security boundary. It isolates the global scope and
    // enforces a wall-clock timeout, but a determined script can still escape the
    // context (e.g. via constructor/prototype reaches) and access the host. This
    // is "sandboxed-ish with a timeout" — acceptable for flows authored by
    // trusted workspace members, NOT for running untrusted user code. For that,
    // run in a real isolate (isolated-vm) or an out-of-process worker/container.
    const sandbox: Record<string, unknown> = { input, output: undefined };
    vm.createContext(sandbox);
    const wrapped = `(function() { "use strict";\n${code}\n})()`;
    try {
      const result = vm.runInContext(wrapped, sandbox, {
        timeout: CODE_TIMEOUT_MS,
        displayErrors: true,
      });
      return { output: result !== undefined ? result : sandbox.output };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Script error';
      throw new Error(`Code execution failed: ${msg}`);
    }
  }

  // ─── Email Sender Node ────────────────────────────────────
  private async runEmailSender(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { to, subject, body, from = 'agentflow@yourdomain.com' } = node.data.config as {
      to: string;
      subject: string;
      body: string;
      from?: string;
    };

    const resolvedTo = this.interpolate(to, input);
    const resolvedSubject = this.interpolate(subject, input);
    const resolvedBody = this.interpolate(body, input);

    const result = await this.resend.emails.send({
      from,
      to: resolvedTo,
      subject: resolvedSubject,
      html: resolvedBody,
    });

    return { id: result.data?.id, to: resolvedTo, subject: resolvedSubject };
  }

  // ─── Data Transform Node ──────────────────────────────────
  private async runDataTransform(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { operation, field, value } = node.data.config as {
      operation: 'pick' | 'omit' | 'merge' | 'map';
      field?: string;
      value?: unknown;
    };

    const data = input[Object.keys(input)[0]] as Record<string, unknown>;

    switch (operation) {
      case 'pick':
        return field ? { [field]: data?.[field] } : data;
      case 'omit':
        if (!field || !data) return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _omitted, ...rest } = data;
        return rest;
      case 'merge':
        return { ...data, ...(value as object || {}) };
      default:
        return data;
    }
  }

  // ─── Webhook Output Node ──────────────────────────────────
  private async runWebhookOutput(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { url, secret } = node.data.config as { url: string; secret?: string };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) headers['X-Webhook-Secret'] = secret;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    return { delivered: response.ok, statusCode: response.status };
  }

  // ─── Condition Node ───────────────────────────────────────
  private async runCondition(node: FlowNode, input: Record<string, unknown>): Promise<unknown> {
    const { field, operator, value } = node.data.config as {
      field: string;
      operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains';
      value: unknown;
    };

    const actual = field.split('.').reduce((obj: unknown, key) => {
      return (obj as Record<string, unknown>)?.[key];
    }, input);

    let result = false;
    switch (operator) {
      case 'eq':       result = actual === value; break;
      case 'neq':      result = actual !== value; break;
      case 'gt':       result = Number(actual) > Number(value); break;
      case 'lt':       result = Number(actual) < Number(value); break;
      case 'contains': result = String(actual).includes(String(value)); break;
    }

    return { result, branch: result ? 'true' : 'false', input };
  }

  // ─── Template interpolation {{key}} ───────────────────────
  private interpolate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const val = path.split('.').reduce((obj: unknown, key: string) => {
        return (obj as Record<string, unknown>)?.[key];
      }, data);
      return val !== undefined ? String(val) : `{{${path}}}`;
    });
  }
}
