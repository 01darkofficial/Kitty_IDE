export interface RuntimeEnv {

    node: string;
    pnpm: string;

}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    runtime: "static" | "node";
    runtime_env: RuntimeEnv;
    visibility: "private" | "public";
    created_at: string;
    updated_at: string;
}

export type FileNode = {
    id: string
    project_id: string
    parent_id: string | null
    name: string
    type: "file" | "folder"
    content: string | null
    created_at: string;
    updated_at: string;
}