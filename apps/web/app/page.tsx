import { prisma } from "@workspace/database"
import { Button } from "@workspace/ui/components/button"

export default async function Page() {
  const user = await prisma.user.findMany()

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
        <div>
          <h2 className="font-medium">User</h2>
          {user.map((u) => (
            <div key={u.id}>
              <p>
                <strong>Name:</strong> {u.name || ""}
              </p>
              <p>
                <strong>Email:</strong> {u.email || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
