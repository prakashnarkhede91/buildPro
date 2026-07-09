import { Badge, Card, PageHead } from "../ui";

const PROPERTY_TYPES = ["1 BHK", "2 BHK", "3 BHK", "Villa", "Plot", "Commercial"];

export default function MasterPropertyTypes() {
  return (
    <div>
      <PageHead title="Master / Property Types" sub="Maintain available property type masters" />
      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROPERTY_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4">
              <span className="font-semibold text-neutral-900">{type}</span>
              <Badge color="green">Active</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
