export default function ProjectTabs({ activeTab, setActiveTab }: any) {
    return (
        <div className="border-b border-zinc-800">

            <button
                className={`px-4 py-2 text-sm border-b-2 ${activeTab === "code"
                    ? "border-zinc-100 text-zinc-100"
                    : "border-transparent text-zinc-400"
                    }`}
                onClick={() => setActiveTab("code")}
            >
                Code
            </button>

        </div>
    )
}