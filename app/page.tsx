"use client";

import { FormEvent, useMemo, useState } from "react";

type SplitRecipient = {
  address: string;
  ratio: number;
};

type FlowNode = {
  id: string;
  ratio: number;
  amount: number;
  label: string;
};

const INITIAL_RECIPIENTS: SplitRecipient[] = [
  { address: "", ratio: 70 },
  { address: "", ratio: 20 },
  { address: "", ratio: 10 },
];

function shortAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function createMockAutoAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Home() {
  const [currency, setCurrency] = useState<"SOL" | "USDC">("SOL");
  const [amount, setAmount] = useState("100");
  const [recipients, setRecipients] = useState<SplitRecipient[]>(INITIAL_RECIPIENTS);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferActive, setTransferActive] = useState(false);
  const [transferRound, setTransferRound] = useState(0);
  const [result, setResult] = useState<string>("");
  const [autoAddress, setAutoAddress] = useState<string>("");

  const ratioTotal = useMemo(
    () => recipients.reduce((sum, item) => sum + (Number.isFinite(item.ratio) ? item.ratio : 0), 0),
    [recipients],
  );

  const flowPreview = useMemo<FlowNode[]>(() => {
    const totalAmount = Number(amount) || 0;
    return recipients.map((item, index) => ({
      id: `wallet-${index}`,
      ratio: item.ratio,
      amount: (totalAmount * item.ratio) / 100,
      label: item.address ? shortAddress(item.address) : `Wallet ${index + 1}`,
    }));
  }, [amount, recipients]);

  const updateRecipient = (index: number, key: keyof SplitRecipient, value: string) => {
    setRecipients((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: key === "ratio" ? Number(value || 0) : value,
            }
          : item,
      ),
    );
  };

  const addRecipient = () => {
    setRecipients((prev) => [...prev, { address: "", ratio: 0 }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validate = () => {
    if (!amount || Number(amount) <= 0) {
      return "请输入大于 0 的分账金额。";
    }
    if (recipients.length < 2) {
      return "至少需要两个收款地址。";
    }
    if (ratioTotal !== 100) {
      return `当前分账比例总和为 ${ratioTotal}% ，必须等于 100%。`;
    }
    const hasEmptyAddress = recipients.some((item) => !item.address.trim());
    if (hasEmptyAddress) {
      return "请填写所有收款地址。";
    }
    return "";
  };

  const runAction = async (action: "split" | "generate") => {
    const error = validate();
    if (error) {
      setResult(error);
      return;
    }

    setIsSubmitting(true);
    setResult("");
    setAutoAddress("");
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (action === "split") {
      setTransferRound((current) => current + 1);
      setTransferActive(true);
      window.setTimeout(() => setTransferActive(false), 5200);
      setResult(
        `分账执行完成：${amount} ${currency} 已按比例发送，并生成 1 条 NFT 收据（不可转移）。${note ? ` 备注：${note}` : ""}`,
      );
    } else {
      const generated = createMockAutoAddress();
      setAutoAddress(generated);
      setResult(`自动分账地址已生成。向该地址转入 ${currency} 将自动按比例分账并记录 NFT 收据。`);
    }
    setIsSubmitting(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(20,241,149,0.22),transparent_30%),radial-gradient(circle_at_80%_24%,rgba(39,117,202,0.24),transparent_28%),linear-gradient(135deg,#07111f_0%,#0b1020_48%,#04111c_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[48px_48px] opacity-30" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
        <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-200 sm:text-xs sm:tracking-[0.38em]">Sankey Flow Dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:mt-3 sm:text-6xl">
              Auto Split <span className="text-emerald-200">Flow</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base">
              左侧发送钱包稳定输出资金，右侧接收钱包按比例承接。管道粗细代表金额，流动光带直接表达转账方向。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/8 p-2 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:rounded-3xl">
            <div className="rounded-xl bg-black/25 p-2 sm:rounded-2xl sm:p-3">
              <p className="text-xs text-slate-400">总金额</p>
              <p className="mt-1 truncate font-mono text-base font-semibold sm:text-lg">{Number(amount || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-black/25 p-2 sm:rounded-2xl sm:p-3">
              <p className="text-xs text-slate-400">币种</p>
              <p className="mt-1 font-mono text-base font-semibold sm:text-lg">{currency}</p>
            </div>
            <div className="rounded-xl bg-black/25 p-2 sm:rounded-2xl sm:p-3">
              <p className="text-xs text-slate-400">比例</p>
              <p className={`mt-1 font-mono text-base font-semibold sm:text-lg ${ratioTotal === 100 ? "text-emerald-200" : "text-rose-300"}`}>
                {ratioTotal}%
              </p>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-5 xl:grid-cols-[1fr_420px]">
          <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/62 p-3 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl sm:min-h-[560px] sm:rounded-4xl sm:p-4">
            <div className="h-full min-h-[414px] overflow-x-auto overflow-y-hidden sm:min-h-[532px]">
              <div className="h-full min-h-[414px] min-w-[820px] sm:min-h-[532px] sm:min-w-0">
                <SankeyDiagram
                  flows={flowPreview}
                  currency={currency}
                  isActive={transferActive}
                  transferRound={transferRound}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/8 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:rounded-4xl sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                  币种
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value as "SOL" | "USDC")}
                    className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none transition focus:border-emerald-300"
                  >
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-300">
                  总金额
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none transition focus:border-emerald-300"
                  />
                </label>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">收款地址与比例</h2>
                  <span className={`text-sm font-semibold ${ratioTotal === 100 ? "text-emerald-200" : "text-rose-300"}`}>
                    合计 {ratioTotal}%
                  </span>
                </div>

                <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1">
                  {recipients.map((recipient, index) => (
                    <div key={`recipient-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                          Wallet {index + 1}
                        </span>
                        <span className="font-mono text-xs text-slate-500">{recipient.ratio}%</span>
                      </div>
                      <input
                        placeholder="Solana 收款地址"
                        value={recipient.address}
                        onChange={(event) => updateRecipient(index, "address", event.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                      />
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={recipient.ratio}
                          onChange={(event) => updateRecipient(index, "ratio", event.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                        />
                        <button
                          type="button"
                          disabled={recipients.length <= 2}
                          onClick={() => removeRecipient(index)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRecipient}
                  className="mt-3 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/15"
                >
                  + 添加收款地址
                </button>
              </div>

              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-300">
                交易备注（可选）
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="例如：3月内容分账"
                  className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none transition focus:border-emerald-300"
                />
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => runAction("split")}
                  className="rounded-xl bg-emerald-300 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-200 disabled:opacity-50"
                >
                  {isSubmitting ? "执行中..." : "执行分账"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => runAction("generate")}
                  className="rounded-xl border border-cyan-300/50 bg-cyan-300/10 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
                >
                  {isSubmitting ? "生成中..." : "生成自动分账地址"}
                </button>
              </div>

              <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-400">
                <p className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="font-semibold text-emerald-200">执行分帐：</span>
                  立即完成分帐，并生成NFT收据（NFT不可转移）。
                </p>
                <p className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="font-semibold text-cyan-200">生成自动分帐地址：</span>
                  系统返回一个 Solana 地址；任何人向该地址转账 USDC / SOL，合约都将自动按比例分账，钱直接进入各自钱包，并生成NFT收据（NFT不可转移）。
                </p>
              </div>

              {result && <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-slate-200">{result}</p>}
              {autoAddress && (
                <div className="mt-3 rounded-2xl border border-emerald-300/30 bg-black/25 p-3">
                  <p className="text-xs text-slate-500">自动分账地址</p>
                  <p className="mt-1 break-all font-mono text-sm text-emerald-200">{autoAddress}</p>
                </div>
              )}
            </form>

            <aside className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl sm:rounded-4xl sm:p-5">
              <h2 className="text-lg font-semibold">接收明细</h2>
              <p className="mt-1 text-sm text-slate-400">每个接收钱包旁同步显示比例和预计到账金额。</p>
              <ul className="mt-4 space-y-3 text-sm">
                {flowPreview.map((item) => (
                  <li key={`summary-${item.id}`} className={`rounded-2xl border border-white/10 bg-black/25 p-3 ${transferActive ? "receiver-pulse" : ""}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-slate-200">{item.label}</span>
                      <span className="font-semibold text-emerald-200">{item.ratio}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
                      <div className="h-full rounded-full bg-linear-to-r from-emerald-300 to-cyan-300" style={{ width: `${Math.min(item.ratio, 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.amount.toFixed(3)} {currency}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}

function SankeyDiagram({
  flows,
  currency,
  isActive,
  transferRound,
}: {
  flows: FlowNode[];
  currency: "SOL" | "USDC";
  isActive: boolean;
  transferRound: number;
}) {
  const senderY = 300;
  const receiverStart = Math.max(110, 300 - (flows.length - 1) * 58);
  const spacing = flows.length > 1 ? Math.min(130, 380 / (flows.length - 1)) : 0;
  const accent = currency === "SOL" ? "#14f195" : "#38bdf8";

  return (
    <div className="relative h-full min-h-[414px] sm:min-h-[520px]">
      <div className="absolute left-4 top-1/2 z-10 w-44 -translate-y-1/2 rounded-3xl border border-emerald-300/30 bg-slate-950/88 p-4 shadow-[0_0_40px_rgba(20,241,149,0.18)] backdrop-blur sm:left-6 sm:w-52 sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200 sm:text-xs sm:tracking-[0.24em]">Sender Wallet</p>
        <p className="mt-2 font-mono text-xs text-slate-300 sm:mt-3 sm:text-sm">Main Treasury</p>
        <p className="mt-3 text-2xl font-black text-white sm:mt-4 sm:text-3xl">100%</p>
        <div className="mt-3 h-2 rounded-full bg-emerald-300/20 sm:mt-4">
          <div className="h-full rounded-full bg-emerald-300" />
        </div>
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="pipeGlow" x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="48%" stopColor="#f8fafc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {flows.map((flow, index) => {
          const y = receiverStart + index * spacing;
          const width = Math.max(10, Math.min(48, flow.ratio * 0.46));
          const d = `M 225 ${senderY} C 410 ${senderY}, 450 ${y}, 770 ${y}`;

          return (
            <g key={`${flow.id}-${transferRound}`}>
              <path d={d} stroke={accent} strokeWidth={width + 18} strokeLinecap="round" opacity="0.08" fill="none" />
              <path
                d={d}
                stroke="url(#pipeGradient)"
                strokeWidth={width}
                strokeLinecap="round"
                opacity={isActive ? "0.78" : "0.48"}
                fill="none"
                filter="url(#pipeGlow)"
              />
              <path
                d={d}
                className={`sankey-flow-light ${isActive ? "sankey-flow-light-active" : ""}`}
                stroke="#ffffff"
                strokeWidth={Math.max(4, width * 0.22)}
                strokeLinecap="round"
                fill="none"
                pathLength="100"
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute right-4 top-0 z-10 flex h-full w-56 flex-col justify-center gap-3 sm:right-6 sm:w-64 sm:gap-4">
        {flows.map((flow, index) => {
          const yPercent = flows.length > 1 ? (index / (flows.length - 1)) * 100 : 50;

          return (
            <div
              key={`${flow.id}-card`}
              className={`relative rounded-2xl border border-cyan-300/25 bg-slate-950/88 p-3 shadow-[0_0_34px_rgba(34,211,238,0.12)] backdrop-blur sm:rounded-3xl sm:p-4 ${isActive ? "receiver-pulse" : ""}`}
              style={{ transform: flows.length > 1 ? `translateY(${(yPercent - 50) * 0.08}px)` : undefined }}
            >
              <div className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-cyan-200/70 bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.75)] sm:-left-3 sm:h-6 sm:w-6" />
              <p className="truncate font-mono text-xs text-cyan-100">{flow.label}</p>
              <div className="mt-2 flex items-end justify-between sm:mt-3">
                <div>
                  <p className="text-2xl font-black text-white sm:text-3xl">{flow.ratio}%</p>
                  <p className="mt-1 text-xs text-slate-400">Split Ratio</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-semibold text-emerald-200 sm:text-sm">
                    {flow.amount.toFixed(3)} {currency}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Expected In</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
