import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardItem {
  label: string
  value: string | number
  description: string
}

export function SectionCards({ items }: { items: SectionCardItem[] }) {
  return (
    <div
      className="
        grid gap-4 px-4 lg:px-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >
      {items.map((item, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription className="text-2xl mb-2">
              {item.label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.value}
            </CardTitle>
          </CardHeader>

          <CardFooter className="flex-col items-start gap-1.5 text-m">
            <div className="text-muted-foreground">
              {item.description}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
