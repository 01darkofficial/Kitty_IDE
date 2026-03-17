"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import ProjectPageHeader from "@/components/Projects/ProjectPage/ProjectPageHeader"
import ProjectTabs from "@/components/Projects/ProjectPage/ProjectTabs"
import ProjectDetails from "@/components/Projects/ProjectPage/ProjectDetails"
import ProjectFileSection from "@/components/Projects/ProjectPage/ProjectFileSection"
import ProjectReadme from "@/components/Projects/ProjectPage/ProjectReadme"
import { Project, FileNode } from "@/types/db"
import { useFileStore } from "@/store/fileStore"


interface ProjectClientProps {
  project: Project;
  files: FileNode[]
}

export default function ProjectClient({ project, files }: ProjectClientProps) {

  const [activeTab, setActiveTab] = useState("code");
  const router = useRouter();

  const setFiles = useFileStore((s) => s.setFiles);

  useEffect(() => {
    setFiles(files)
  }, [files, setFiles])

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto px-8 py-10">

      <ProjectPageHeader
        project={project}
        onOpenEditor={() => router.push(`/ide/editor/${project.id}`)}
      />

      <ProjectTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "code" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">

            <ProjectDetails project={project} />

            <div className="lg:col-span-2 min-h-0 no-scrollbar">
              <ProjectFileSection files={files} />
            </div>

          </div>

          <ProjectReadme />
        </>
      )}

    </div>
  )
}