import TemplateCard from "./TemplateCard"

export default function TemplatesSection() {

    const templates = [
        {
            name: "React App",
            description: "React starter",
        },
        {
            name: "Node API",
            description: "Backend starter",
        },
        {
            name: "Static Website",
            description: "HTML/CSS starter",
        },
        {
            name: "Empty Project",
            description: "Blank workspace",
        },
    ]

    return (
        <section className="mb-12">

            <h2 className="text-lg font-medium mb-4">
                Templates
            </h2>

            <div className="flex gap-6 flex-wrap">

                {templates.map(template => (
                    <TemplateCard
                        key={template.name}
                        name={template.name}
                        description={template.description}
                    />
                ))}

            </div>

        </section>
    )
}