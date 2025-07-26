import type { Route } from "./+types/home";
import TaskManager from "../components/TaskManager";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Task Manager" },
    { name: "description", content: "Manage your tasks efficiently with our task manager!" },
  ];
}

export default function Home() {
  return <TaskManager />;
}
