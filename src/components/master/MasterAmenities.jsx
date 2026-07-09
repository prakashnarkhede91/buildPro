import { Card, PageHead } from "../ui";

const AMENITIES = [
  "Swimming Pool",
  "Club House",
  "Gym",
  "Garden",
  "Security",
  "CCTV",
  "Power Backup",
  "Car Parking",
  "Children Play Area",
  "Lift",
  "Temple",
  "Jogging Track",
];

export default function MasterAmenities() {
  return (
    <div>
      <PageHead title="Master / Amenities" sub="Review the amenities master list" />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3.5 py-3 text-[13px] text-neutral-700">
              <div className="h-2 w-2 shrink-0 rounded-full bg-[blueviolet]" />
              {amenity}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
