// @flow strict
import CountUp from "@/app/components/motion/count-up";
import { highlights } from "@/utils/data/highlights";

function Highlights() {
  return (
    <section aria-label="Highlights" className="bg-[var(--sw-black-raised)] py-10">
      <div className="sw-container">
        <div className="sw-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex flex-col gap-3 bg-[var(--sw-cell)] px-6 py-7">
              <p className="font-[family-name:var(--sw-font-display)] text-[clamp(44px,5vw,60px)] leading-none tracking-[0.02em] text-white">
                <CountUp value={item.value} from={item.from} prefix={item.prefix} suffix={item.suffix} />
              </p>
              <p className="max-w-[30ch] text-[13px] leading-relaxed text-[var(--sw-silver)]">{item.label}</p>
              <p className="sw-label mt-auto pt-2">{item.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Highlights;
