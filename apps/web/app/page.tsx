import { prisma } from "@workspace/database"
import { Button } from "@workspace/ui/components/button"

export default async function Page() {
  const products = await prisma.product.findMany()

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
          <h2 className="font-medium">Products</h2>
          {products.map((p) => (
            <div key={p.id}>
              <p>
                <strong>Name:</strong> {p.name || ""}
              </p>
              <p>
                <strong>Price:</strong> {p.price || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
