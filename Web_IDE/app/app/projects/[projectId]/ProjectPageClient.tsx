"use client";

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectHero from "@/components/Projects/ProjectPage/ProjectHero"
import ProjectSnapshot from "@/components/Projects/ProjectPage/ProjectSnapshot"
import ProjectFileSection from "@/components/Projects/ProjectPage/ProjectFileSection"
import ProjectReadme from "@/components/Projects/ProjectPage/ProjectReadme"
import { FileNode, Project } from "@/types/db"
import { useFileStore } from "@/store/fileStore"

interface ProjectClientProps {
  project: Project
  files: FileNode[]
}

export default function ProjectPageClient({
  project,
  files,
}: ProjectClientProps) {

  const router = useRouter()
  const setFiles = useFileStore((s) => s.setFiles)

  useEffect(() => {
    setFiles(files)
  }, [files, setFiles])

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-10 lg:pb-10">
      <ProjectHero
        project={project}
        onOpenEditor={() => router.push(`/ide/editor/${project.id}`)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <ProjectSnapshot project={project} files={files} />
        </div>

        <div className="lg:col-span-2">
          <ProjectFileSection files={files} />
        </div>
      </div>

      <ProjectReadme />
    </main>
  )
}