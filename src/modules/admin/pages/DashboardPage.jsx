import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MessageSquare,
  PieChart,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/Shared';
import { useApp } from '@/shared/context/AppContext';
import { services } from '@/shared/data/content';
import { formatDate } from '@/shared/lib/dates';

const DEMO_GROSS_MARGIN_RATE = 0.34;

const currency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormat = new Intl.NumberFormat('en-AU');

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return currency.format(safeNumber(value));
}

function serviceName(id) {
  return services.find(service => service.id === id)?.name || 'Custom clean';
}

function bookingValue(booking) {
  const confirmed = booking?.confirmedTotal;
  const estimated = booking?.priceSnapshot?.total;

  if (
    confirmed !== null &&
    confirmed !== undefined &&
    confirmed !== '' &&
    Number.isFinite(Number(confirmed))
  ) {
    return safeNumber(confirmed);
  }

  if (
    estimated !== null &&
    estimated !== undefined &&
    estimated !== '' &&
    Number.isFinite(Number(estimated))
  ) {
    return safeNumber(estimated);
  }

  return 0;
}

function bookingCreatedDate(booking) {
  const candidate = booking?.createdAt || booking?.date;
  const date = candidate ? new Date(candidate) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function lastSixMonths() {
  const now = new Date();
  const months = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

    months.push({
      key: monthKey(date),
      label: date.toLocaleDateString('en-AU', { month: 'short' }),
      longLabel: date.toLocaleDateString('en-AU', {
        month: 'long',
        year: 'numeric',
      }),
    });
  }

  return months;
}

function currentGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayISO() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function percentage(part, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (part / total) * 100));
}

function DashboardHeader({ data }) {
  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#163b52] bg-[#102d43] text-white shadow-[0_24px_70px_rgba(16,45,67,0.14)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/[0.08]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/10" />

      <div className="relative grid gap-7 p-6 sm:p-8 xl:grid-cols-[1.35fr_.65fr] xl:p-9">
        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a7dddb]">
                <Sparkles size={13} />
                Executive overview
              </span>

              <span className="text-xs font-medium text-white/55">{today}</span>
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl xl:text-[2.85rem] xl:leading-[1.08]">
              {currentGreeting()}, Matelink.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              A clear view of bookings, revenue, customer activity and the next actions that
              need your attention.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 border border-white bg-white px-5 text-[#102d43] hover:bg-[#f3f6f7] hover:text-[#102d43]"
            >
              <Link to="/admin/bookings">
                Review bookings
                <ArrowRight size={15} />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 border-white/20 bg-white/[0.04] px-5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/admin/pricing">
                Review pricing
                <TrendingUp size={15} />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a7dddb]">
                Today
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Operations pulse
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#a7dddb]">
              <Zap size={18} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <HeroMiniStat
              label="Jobs today"
              value={numberFormat.format(data.todayJobs)}
              helper={data.todayJobs ? 'Scheduled work' : 'No jobs today'}
            />

            <HeroMiniStat
              label="Needs action"
              value={numberFormat.format(data.attentionCount)}
              helper="Open items"
            />

            <HeroMiniStat
              label="Pipeline value"
              value={compactCurrency.format(data.totalValue)}
              helper="Active bookings"
            />

            <HeroMiniStat
              label="Paid"
              value={`${data.paymentCollectionRate.toFixed(0)}%`}
              helper="Of booked value"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMiniStat({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1 text-[10px] text-white/45">{helper}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  badge,
  emphasis = false,
  progress,
}) {
  return (
    <Card
      className={`group relative overflow-hidden rounded-[22px] border p-0 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(16,45,67,0.08)] ${
        emphasis
          ? 'border-[#163b52] bg-[#102d43] text-white'
          : 'border-border/80 bg-white'
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 ${
          emphasis ? 'bg-[#7dc8c4]' : 'bg-primary/80 opacity-0 group-hover:opacity-100'
        }`}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl ${
              emphasis ? 'bg-white/10 text-white' : 'bg-secondary text-primary'
            }`}
          >
            <Icon size={18} strokeWidth={1.9} />
          </div>

          {badge ? (
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                emphasis
                  ? 'bg-white/10 text-white/70'
                  : 'border border-border/70 bg-[#faf9f6] text-muted-foreground'
              }`}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <p
          className={`mt-5 text-[10px] font-bold uppercase tracking-[0.1em] ${
            emphasis ? 'text-white/50' : 'text-muted-foreground'
          }`}
        >
          {label}
        </p>

        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-[2.1rem]">
          {value}
        </p>

        <p
          className={`mt-2 min-h-[20px] text-xs leading-5 ${
            emphasis ? 'text-white/55' : 'text-muted-foreground'
          }`}
        >
          {note}
        </p>

        {typeof progress === 'number' ? (
          <div className="mt-5">
            <div
              className={`h-1.5 overflow-hidden rounded-full ${
                emphasis ? 'bg-white/10' : 'bg-muted'
              }`}
            >
              <div
                className={`h-full rounded-full ${
                  emphasis ? 'bg-[#8ed0cc]' : 'bg-primary'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value, helper, to }) {
  const content = (
    <div
      className={`flex h-full items-center gap-4 rounded-2xl border border-border/70 bg-white p-4 transition ${
        to ? 'hover:border-primary/25 hover:bg-[#fbfdfc]' : ''
      }`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold tracking-[-0.035em] text-foreground">
          {value}
        </p>
        <p className="mt-1 truncate text-[10px] text-muted-foreground">{helper}</p>
      </div>

      {to ? <ChevronRight size={16} className="shrink-0 text-muted-foreground" /> : null}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function SectionHeader({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-primary">
          {Icon ? <Icon size={15} /> : null}
          <span className="text-[10px] font-bold uppercase tracking-[0.13em]">{eyebrow}</span>
        </div>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-[1.35rem]">
          {title}
        </h2>

        {description ? (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

function ChartTooltip({ left, top, title, value, secondary }) {
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[138px] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl border border-border bg-white px-3.5 py-3 shadow-[0_16px_38px_rgba(16,45,67,0.15)]"
      style={{ left, top }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
      {secondary ? (
        <p className="mt-1 text-[10px] text-muted-foreground">{secondary}</p>
      ) : null}
    </div>
  );
}

function RevenueTrendChart({ data }) {
  const [hovered, setHovered] = useState(null);

  const width = 760;
  const height = 300;
  const leftPadding = 22;
  const rightPadding = 22;
  const topPadding = 26;
  const bottomPadding = 46;
  const chartWidth = width - leftPadding - rightPadding;
  const chartHeight = height - topPadding - bottomPadding;
  const maxValue = Math.max(...data.map(item => item.value), 1);

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? leftPadding + chartWidth / 2
        : leftPadding + (index / (data.length - 1)) * chartWidth;

    const y = topPadding + chartHeight - (item.value / maxValue) * chartHeight;

    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${
        topPadding + chartHeight
      } L ${points[0].x} ${topPadding + chartHeight} Z`
    : '';

  const active = hovered === null ? null : points[hovered];

  return (
    <div className="relative mt-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[270px] w-full overflow-visible"
        role="img"
        aria-label="Six month booked value trend"
      >
        <defs>
          <linearGradient id="premiumDashboardArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#087e83" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#087e83" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => {
          const y = topPadding + chartHeight * fraction;

          return (
            <line
              key={index}
              x1={leftPadding}
              x2={width - rightPadding}
              y1={y}
              y2={y}
              stroke="#dce5e9"
              strokeWidth="1"
              strokeDasharray="4 7"
              opacity="0.65"
            />
          );
        })}

        {areaPath ? <path d={areaPath} fill="url(#premiumDashboardArea)" /> : null}

        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="#087e83"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {points.map((point, index) => (
          <g key={point.key}>
            {hovered === index ? (
              <line
                x1={point.x}
                x2={point.x}
                y1={topPadding}
                y2={topPadding + chartHeight}
                stroke="#087e83"
                strokeWidth="1"
                strokeDasharray="4 5"
                opacity="0.35"
              />
            ) : null}

            <circle
              cx={point.x}
              cy={point.y}
              r={hovered === index ? 6.5 : 4.5}
              fill="#ffffff"
              stroke="#087e83"
              strokeWidth={hovered === index ? 3 : 2}
            />

            <rect
              x={point.x - chartWidth / Math.max(data.length, 1) / 2}
              y={0}
              width={chartWidth / Math.max(data.length, 1)}
              height={height - bottomPadding + 10}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            />

            <text
              x={point.x}
              y={height - 14}
              textAnchor="middle"
              fill="#6b7e89"
              fontSize="12"
              fontWeight="600"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      {active ? (
        <ChartTooltip
          left={`${(active.x / width) * 100}%`}
          top={`${(active.y / height) * 100}%`}
          title={active.longLabel}
          value={formatMoney(active.value)}
          secondary={`${active.orders} order${active.orders === 1 ? '' : 's'}`}
        />
      ) : null}
    </div>
  );
}

function StatusDonut({ data, total }) {
  const [hovered, setHovered] = useState(null);

  const size = 190;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const palette = ['#087e83', '#102d43', '#77b9b6', '#d6a960', '#c8d3d8'];

  let consumed = 0;

  return (
    <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
      <div className="relative mx-auto h-[190px] w-[190px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#edf1f2"
            strokeWidth="18"
          />

          {data.map((item, index) => {
            const fraction = total > 0 ? item.value / total : 0;
            const dash = fraction * circumference;
            const offset = -consumed * circumference;
            consumed += fraction;

            return (
              <circle
                key={item.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={palette[index % palette.length]}
                strokeWidth={hovered === index ? 22 : 18}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {hovered === null ? total : data[hovered]?.value || 0}
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {hovered === null ? 'Total orders' : data[hovered]?.label}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
              hovered === index ? 'bg-secondary' : 'hover:bg-muted/70'
            }`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />

              <span className="truncate text-sm font-medium text-foreground">
                {item.label}
              </span>
            </span>

            <span className="ml-3 text-sm font-bold text-foreground">{item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ServicePerformance({ data }) {
  const [hovered, setHovered] = useState(null);

  const maxCount = Math.max(...data.map(item => item.count), 1);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const width = (item.count / maxCount) * 100;

        return (
          <div
            key={item.key}
            className={`relative rounded-2xl border p-4 transition ${
              hovered === index
                ? 'border-primary/25 bg-[#fbfdfc]'
                : 'border-border/70 bg-white'
            }`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {item.count} booking{item.count === 1 ? '' : 's'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{formatMoney(item.value)}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Booked value
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(width, item.count ? 6 : 0)}%` }}
              />
            </div>

            {hovered === index ? (
              <div className="absolute right-4 top-[-32px] z-20 rounded-lg border bg-white px-2.5 py-1.5 text-[10px] font-semibold shadow-lg">
                {item.count} booking{item.count === 1 ? '' : 's'} · {formatMoney(item.value)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FunnelStep({ label, value, total, helper, isLast }) {
  const rate = percentage(value, total);

  return (
    <div className="relative flex-1">
      <div className="rounded-2xl border border-border/70 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-foreground">
              {numberFormat.format(value)}
            </p>
          </div>

          <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold text-primary">
            {rate.toFixed(0)}%
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground">{helper}</p>
      </div>

      {!isLast ? (
        <div className="absolute -right-[18px] top-1/2 z-10 hidden -translate-y-1/2 xl:grid h-8 w-8 place-items-center rounded-full border bg-[#f7f6f2] text-muted-foreground">
          <ChevronRight size={15} />
        </div>
      ) : null}
    </div>
  );
}

function PaymentHealth({ paid, outstanding, total, collectionRate }) {
  return (
    <div className="rounded-[22px] bg-[#102d43] p-5 text-white sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#a7dddb]">
            Payment health
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
            Revenue collection
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#a7dddb]">
          <WalletCards size={18} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/45">
            Paid revenue
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            {formatMoney(paid)}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/45">
            Outstanding
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {formatMoney(outstanding)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-white/55">Collection rate</span>
          <strong>{collectionRate.toFixed(0)}%</strong>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#8ed0cc]"
            style={{ width: `${collectionRate}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[10px] text-white/40">
          <span>{formatMoney(paid)} collected</span>
          <span>{formatMoney(total)} pipeline</span>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ booking }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">
            {booking.customer?.name || 'Customer'}
          </p>

          <span className="rounded-full bg-[#fff4dc] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#7c591a]">
            Pending
          </span>
        </div>

        <p className="mt-1.5 text-xs text-muted-foreground">
          {serviceName(booking.service)} · {booking.reference}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {booking.date ? formatDate(booking.date) : 'Date not agreed'} ·{' '}
          {booking.postcode || '—'} · {formatMoney(bookingValue(booking))}
        </p>
      </div>

      <Button asChild variant="outline" size="sm" className="shrink-0 bg-white">
        <Link to={`/admin/bookings?booking=${booking.id}`}>
          Review
          <ChevronRight size={14} />
        </Link>
      </Button>
    </div>
  );
}

export function DashboardPage() {
  const { bookings, quotes, contacts, notifications } = useApp();

  const data = useMemo(() => {
    const nonDemoBookings = bookings.filter(booking => !booking.demo);
    const dashboardBookings = nonDemoBookings.length ? nonDemoBookings : bookings;

    const activeBookings = dashboardBookings.filter(booking => booking.status !== 'cancelled');
    const pending = dashboardBookings.filter(booking => booking.status === 'pending');
    const confirmed = dashboardBookings.filter(booking => booking.status === 'confirmed');
    const cleaning = dashboardBookings.filter(booking => booking.status === 'cleaning');
    const completed = dashboardBookings.filter(booking => booking.status === 'completed');
    const cancelled = dashboardBookings.filter(booking => booking.status === 'cancelled');

    const paidBookings = dashboardBookings.filter(
      booking => booking.paymentStatus === 'paid'
    );

    const totalValue = activeBookings.reduce(
      (sum, booking) => sum + bookingValue(booking),
      0
    );

    const paidRevenue = paidBookings.reduce(
      (sum, booking) => sum + bookingValue(booking),
      0
    );

    const outstanding = Math.max(totalValue - paidRevenue, 0);
    const projectedProfit = totalValue * DEMO_GROSS_MARGIN_RATE;
    const averageOrder = activeBookings.length ? totalValue / activeBookings.length : 0;
    const completionRate = percentage(completed.length, activeBookings.length);
    const paymentCollectionRate = percentage(paidRevenue, totalValue);

    const months = lastSixMonths();

    const monthMap = Object.fromEntries(
      months.map(month => [month.key, { ...month, value: 0, orders: 0 }])
    );

    dashboardBookings.forEach(booking => {
      const date = bookingCreatedDate(booking);
      if (!date) return;

      const key = monthKey(date);
      if (!monthMap[key]) return;

      monthMap[key].orders += 1;

      if (booking.status !== 'cancelled') {
        monthMap[key].value += bookingValue(booking);
      }
    });

    const statusData = [
      { key: 'pending', label: 'Pending', value: pending.length },
      { key: 'confirmed', label: 'Confirmed', value: confirmed.length },
      { key: 'cleaning', label: 'Cleaning', value: cleaning.length },
      { key: 'completed', label: 'Completed', value: completed.length },
      { key: 'cancelled', label: 'Cancelled', value: cancelled.length },
    ];

    const serviceData = services.map(service => {
      const matching = dashboardBookings.filter(booking => booking.service === service.id);

      return {
        key: service.id,
        label: service.name,
        count: matching.length,
        value: matching
          .filter(booking => booking.status !== 'cancelled')
          .reduce((sum, booking) => sum + bookingValue(booking), 0),
      };
    });

    const upcoming = dashboardBookings
      .filter(
        booking =>
          ['confirmed', 'cleaning'].includes(booking.status) && booking.date
      )
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(0, 5);

    const reviewQueue = pending
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5);

    const openRecleans = dashboardBookings.reduce((count, booking) => {
      const requests = booking.recleans || [];

      return (
        count +
        requests.filter(
          request => !['completed', 'declined'].includes(request.status)
        ).length
      );
    }, 0);

    const today = todayISO();

    const todayJobs = dashboardBookings.filter(
      booking =>
        booking.date === today &&
        ['confirmed', 'cleaning'].includes(booking.status)
    ).length;

    return {
      dashboardBookings,
      activeBookings,
      pending,
      confirmed,
      cleaning,
      completed,
      cancelled,
      totalValue,
      paidRevenue,
      outstanding,
      projectedProfit,
      averageOrder,
      completionRate,
      paymentCollectionRate,
      monthlyTrend: months.map(month => monthMap[month.key]),
      statusData,
      serviceData,
      upcoming,
      reviewQueue,
      openRecleans,
      todayJobs,
    };
  }, [bookings]);

  const newQuotes = quotes.filter(quote => quote.status === 'new').length;

  const transfers = data.dashboardBookings.filter(
    booking => booking.paymentStatus === 'awaiting_verification'
  ).length;

  const attentionCount =
    data.pending.length + newQuotes + transfers + data.openRecleans;

  const dashboardData = {
    ...data,
    attentionCount,
  };

  const quoteValue = quotes
    .filter(quote => ['quoted', 'accepted'].includes(quote.status))
    .reduce((sum, quote) => sum + safeNumber(quote.amount), 0);

  const recentNotifications = notifications.slice(0, 4);

  const totalOrders = data.dashboardBookings.length;
  const postPending = data.confirmed.length + data.cleaning.length + data.completed.length;

  return (
    <div className="pb-12">
      <DashboardHeader data={dashboardData} />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          icon={ShoppingBag}
          label="Total orders"
          value={numberFormat.format(totalOrders)}
          note={`${data.activeBookings.length} active / non-cancelled`}
          badge="All time"
          emphasis
          progress={100}
        />

        <MetricCard
          icon={Clock3}
          label="Pending review"
          value={numberFormat.format(data.pending.length)}
          note="Bookings waiting for approval"
          badge={data.pending.length ? 'Action' : 'Clear'}
          progress={percentage(data.pending.length, Math.max(totalOrders, 1))}
        />

        <MetricCard
          icon={BadgeCheck}
          label="Confirmed"
          value={numberFormat.format(data.confirmed.length)}
          note={`${data.cleaning.length} currently in cleaning`}
          badge="Pipeline"
          progress={percentage(data.confirmed.length, Math.max(totalOrders, 1))}
        />

        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={numberFormat.format(data.completed.length)}
          note={`${data.completionRate.toFixed(0)}% completion rate`}
          badge="Delivered"
          progress={data.completionRate}
        />

        <MetricCard
          icon={CircleDollarSign}
          label="Booked value"
          value={compactCurrency.format(data.totalValue)}
          note={`${formatMoney(data.paidRevenue)} marked paid`}
          badge="AUD"
          progress={data.paymentCollectionRate}
        />

        <MetricCard
          icon={TrendingUp}
          label="Est. profit margin"
          value={`${Math.round(DEMO_GROSS_MARGIN_RATE * 100)}%`}
          note={`${formatMoney(data.projectedProfit)} projected gross profit`}
          badge="Demo model"
          progress={DEMO_GROSS_MARGIN_RATE * 100}
        />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          icon={Target}
          label="Average order value"
          value={formatMoney(data.averageOrder)}
          helper="Across active bookings"
        />

        <MiniStat
          icon={MessageSquare}
          label="New quote requests"
          value={numberFormat.format(newQuotes)}
          helper={`${formatMoney(quoteValue)} quoted pipeline`}
          to="/admin/quotes"
        />

        <MiniStat
          icon={CreditCard}
          label="Transfers to verify"
          value={numberFormat.format(transfers)}
          helper="Manual payment checks"
          to="/admin/payments"
        />

        <MiniStat
          icon={RefreshCw}
          label="Open re-clean requests"
          value={numberFormat.format(data.openRecleans)}
          helper="Bond Back Guarantee workflow"
          to="/admin/recleans"
        />
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[1.5fr_.75fr]">
        <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
          <SectionHeader
            icon={Activity}
            eyebrow="Performance"
            title="Booked value trend"
            description="Last six months · hover over any month to inspect value and order count."
            action={
              <div className="rounded-xl bg-secondary px-4 py-3 text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
                  Current pipeline
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatMoney(data.totalValue)}
                </p>
              </div>
            }
          />

          <div className="px-3 pb-4 pt-2 sm:px-6 sm:pb-6">
            <RevenueTrendChart data={data.monthlyTrend} />
          </div>
        </Card>

        <Card className="rounded-[24px] border-border/80 p-5 shadow-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <PieChart size={15} />
                <span className="text-[10px] font-bold uppercase tracking-[0.13em]">
                  Order health
                </span>
              </div>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                Booking status mix
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Hover a segment or status to inspect the count.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <StatusDonut data={data.statusData} total={totalOrders} />
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
          <SectionHeader
            icon={Target}
            eyebrow="Booking funnel"
            title="From request to completed clean"
            description="A simple operational funnel showing how bookings move through the workflow."
          />

          <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-4">
            <FunnelStep
              label="Requests"
              value={totalOrders}
              total={Math.max(totalOrders, 1)}
              helper="All booking requests"
            />

            <FunnelStep
              label="Accepted"
              value={postPending}
              total={Math.max(totalOrders, 1)}
              helper="Beyond pending review"
            />

            <FunnelStep
              label="In progress"
              value={data.confirmed.length + data.cleaning.length}
              total={Math.max(totalOrders, 1)}
              helper="Confirmed or being cleaned"
            />

            <FunnelStep
              label="Completed"
              value={data.completed.length}
              total={Math.max(totalOrders, 1)}
              helper="Successfully delivered"
              isLast
            />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
          <SectionHeader
            icon={Users}
            eyebrow="Demand"
            title="Service performance"
            description="Booking volume and booked value by cleaning service."
          />

          <div className="p-5 sm:p-6">
            <ServicePerformance data={data.serviceData} />
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
          <SectionHeader
            icon={Clock3}
            eyebrow="Attention needed"
            title="Requests to review"
            description="Prioritise pending booking requests before they go cold."
            action={
              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                View all
                <ArrowRight size={13} />
              </Link>
            }
          />

          {data.reviewQueue.length ? (
            <div>
              {data.reviewQueue.map(booking => (
                <RequestRow key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="You’re up to date."
              description="New booking requests will appear here."
            />
          )}
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[.92fr_1.08fr]">
        <Card className="rounded-[24px] border-border/80 p-5 shadow-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-primary">
                Financial snapshot
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                Revenue & margin
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Cash collection and illustrative gross profit position.
              </p>
            </div>

            <WalletCards size={20} className="text-primary" />
          </div>

          <div className="mt-6">
            <PaymentHealth
              paid={data.paidRevenue}
              outstanding={data.outstanding}
              total={data.totalValue}
              collectionRate={data.paymentCollectionRate}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-[#faf9f6] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Projected gross profit
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                {formatMoney(data.projectedProfit)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-[#faf9f6] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Demo gross margin
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                {Math.round(DEMO_GROSS_MARGIN_RATE * 100)}%
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/35 p-4">
            <p className="text-[10px] font-semibold leading-5 text-muted-foreground">
              Profit is currently a demo estimate because the frontend does not yet store labour,
              contractor or operating-cost data. Replace the 34% assumption when the Laravel API
              provides real cost information.
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
          <SectionHeader
            icon={CalendarDays}
            eyebrow="Schedule"
            title="Next on the calendar"
            description="Upcoming confirmed jobs and cleans already in progress."
            action={
              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Full schedule
                <ArrowRight size={13} />
              </Link>
            }
          />

          {data.upcoming.length ? (
            <div>
              {data.upcoming.map((booking, index) => (
                <div
                  className="flex items-start gap-4 border-b border-border/70 px-5 py-5 last:border-0 sm:px-6"
                  key={booking.id}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <CalendarDays size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {booking.date ? formatDate(booking.date) : 'Date pending'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {serviceName(booking.service)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-primary">
                          {index === 0 ? 'Next' : booking.status}
                        </span>
                        <p className="mt-2 text-xs font-semibold text-foreground">
                          {formatMoney(bookingValue(booking))}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 truncate text-[11px] text-muted-foreground">
                      {booking.customer?.name || 'Customer'} · {booking.postcode || '—'} ·{' '}
                      {booking.time || 'Time to be arranged'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Calendar is clear."
              description="Confirmed and active cleans will appear here."
            />
          )}
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          icon={MessageSquare}
          label="Customer enquiries"
          value={numberFormat.format(contacts.length)}
          helper="Contact form submissions"
        />

        <MiniStat
          icon={ReceiptText}
          label="Activity previews"
          value={numberFormat.format(notifications.length)}
          helper="Generated notification events"
        />

        <MiniStat
          icon={CreditCard}
          label="Payment verification"
          value={numberFormat.format(transfers)}
          helper="Transfers requiring checks"
          to="/admin/payments"
        />

        <MiniStat
          icon={Activity}
          label="Operational actions"
          value={numberFormat.format(attentionCount)}
          helper="Bookings, quotes, payments & re-cleans"
        />
      </section>

      {recentNotifications.length ? (
        <section className="mt-6">
          <Card className="overflow-hidden rounded-[24px] border-border/80 p-0 shadow-none">
            <SectionHeader
              icon={ReceiptText}
              eyebrow="Recent activity"
              title="Notification previews"
              description="Latest locally generated events in this frontend demo."
            />

            <div className="grid divide-y divide-border/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {recentNotifications.map(notification => (
                <div key={notification.id} className="flex gap-4 p-5 sm:p-6">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <ReceiptText size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize text-foreground">
                      {notification.event || 'Activity'} notification
                    </p>

                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {notification.to || 'No recipient'}
                    </p>

                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Preview generated · Not sent
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

export default DashboardPage;
