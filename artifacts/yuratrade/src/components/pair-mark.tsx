import { useState } from "react";

type Group = "fx" | "crypto" | "stock" | "commodity";

const country: Record<string, string> = {
  AED: "ae", ARS: "ar", AUD: "au", BDT: "bd", BHD: "bh", BRL: "br", CAD: "ca", CHF: "ch", CLP: "cl",
  CNH: "cn", CNY: "cn", COP: "co", DZD: "dz", EGP: "eg", EUR: "eu", GBP: "gb", HUF: "hu", IDR: "id",
  INR: "in", IRR: "ir", JOD: "jo", JPY: "jp", KES: "ke", LBP: "lb", MAD: "ma", MXN: "mx", MYR: "my",
  NGN: "ng", NOK: "no", NZD: "nz", OMR: "om", PHP: "ph", PKR: "pk", QAR: "qa", RUB: "ru", SAR: "sa",
  SGD: "sg", SYP: "sy", THB: "th", TND: "tn", TRY: "tr", UAH: "ua", USD: "us", VND: "vn", YER: "ye", ZAR: "za",
  PLN: "pl", SEK: "se", DKK: "dk", CZK: "cz", ILS: "il", KRW: "kr", HKD: "hk", KWD: "kw", BGN: "bg", RON: "ro",
};

const stockTicker: Record<string, string> = {
  AAPL: "AAPL", MSFT: "MSFT", AMZN: "AMZN", TSLA: "TSLA", NFLX: "NFLX", AMD: "AMD", INTC: "INTC",
  CSCO: "CSCO", PFE: "PFE", JNJ: "JNJ", AXP: "AXP", XOM: "XOM", BA: "BA", MCD: "MCD", VISA: "V",
  CITI: "C", FDX: "FDX", GME: "GME", BABA: "BABA", COIN: "COIN", PLTR: "PLTR", MARA: "MARA", FB: "META",
};

function cryptoCode(symbol: string) {
  const value = symbol.toUpperCase();
  if (value.startsWith("BITB") || value.startsWith("BTC")) return "btc";
  if (value.startsWith("ETH")) return "eth";
  if (value.startsWith("BNB")) return "bnb";
  if (value.startsWith("ADA")) return "ada";
  if (value.startsWith("LINK")) return "link";
  if (value.startsWith("MATIC")) return "matic";
  if (value.startsWith("SOL")) return "sol";
  if (value.startsWith("DOGE")) return "doge";
  if (value.startsWith("DOT")) return "dot";
  if (value.startsWith("TRX")) return "trx";
  if (value.startsWith("TON")) return "ton";
  if (value.startsWith("LTC")) return "ltc";
  if (value.startsWith("AVAX")) return "avax";
  if (value.startsWith("DASH")) return "dash";
  return "";
}

function pictureOf(symbol: string, group: Group) {
  if (group === "crypto") {
    const code = cryptoCode(symbol);
    return code ? `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/32/color/${code}.png` : "";
  }
  if (group === "stock") {
    const key = symbol.replace(/^#/, "").replace(/_otc$/i, "").toUpperCase();
    const ticker = stockTicker[key];
    return ticker ? `https://financialmodelingprep.com/image-stock/${ticker}.png` : "";
  }
  return "";
}

function Flags({ name }: { name: string }) {
  const parts = name.replace(/\s+OTC$/i, "").split("/");
  const codes = parts.length === 2 ? parts.map((code) => country[code]).filter(Boolean) : [];
  if (codes.length === 0) return null;
  return (
    <span className="flex shrink-0 items-center">
      {codes.map((code, index) => (
        <img
          key={`${code}-${index}`}
          src={`https://flagcdn.com/w40/${code}.png`}
          alt=""
          width={22}
          height={22}
          className={`size-[22px] rounded-full border border-[#2c3a50] object-cover ${index > 0 ? "-ml-1.5" : ""}`}
          decoding="async"
        />
      ))}
    </span>
  );
}

function Commodity({ symbol }: { symbol: string }) {
  const oil = /brent|crude/i.test(symbol);
  const gas = /XNG/i.test(symbol);
  const gold = /XAU/i.test(symbol);
  const silver = /XAG/i.test(symbol);
  const fill = gold ? "#f0c040" : silver ? "#d5dde8" : oil ? "#3dd68c" : gas ? "#ff5d73" : "#8ecbff";
  return (
    <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#1c2636" />
      {oil ? <path d="M16 6c4 6 6 9 6 13a6 6 0 1 1-12 0c0-4 2-7 6-13z" fill={fill} /> : null}
      {gas ? <path d="M16 7c2 4 5 6 5 10a5 5 0 1 1-10 0c0-2 1-3 2-5-1 3 1 4 2 4 0-3 1-6 1-9z" fill={fill} /> : null}
      {gold || silver ? <circle cx="16" cy="16" r="7" fill={fill} /> : null}
      {!oil && !gas && !gold && !silver ? <circle cx="16" cy="16" r="6" fill="none" stroke={fill} strokeWidth="3" /> : null}
    </svg>
  );
}

function Letter({ name }: { name: string }) {
  const letter = name.replace(/\s+OTC$/i, "").trim().slice(0, 1) || "•";
  return <span className="text-xs font-bold text-blue-soft">{letter}</span>;
}

export function PairMark({ symbol, name, group }: { symbol: string; name: string; group: Group }) {
  const [failed, setFailed] = useState(false);
  if (group === "fx") return <Flags name={name} />;
  if (group === "commodity") return <Commodity symbol={symbol} />;
  const src = failed ? "" : pictureOf(symbol, group);
  if (group === "stock" && !src) {
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1c2636]">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <path d="M6 22h4V12H6zm8 0h4V8h-4zm8 0h4v-6h-4z" fill="#8ecbff" />
        </svg>
      </span>
    );
  }
  return (
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c2636]">
      {src ? (
        <img src={src} alt="" width={28} height={28} className="size-7 object-cover" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <Letter name={name} />
      )}
    </span>
  );
}
