import { Textarea } from "@/components/ui/textarea";
export default function Home() {
  return (
    <div className="grid grid-cols-3 gap-4 min-h-screen p-8">
      <div className="col-span-1">
        <Textarea
          className="w-full h-full min-h-[500px] p-4 resize-none"
          placeholder="左侧文本区域"
        />
      </div>

      <div className="col-span-1 flex flex-col items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            转换 →
          </button>
          <button className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            ← 转换
          </button>
        </div>
      </div>

      <div className="col-span-1">
        <Textarea
          className="w-full h-full min-h-[500px] p-4 resize-none"
          placeholder="右侧文本区域"
        />
      </div>
    </div>
  );
}
