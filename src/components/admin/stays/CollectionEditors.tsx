"use client";

import {
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { Plus, Trash2, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { PLACE_CATEGORIES, type StayFormInput } from "@/lib/stay-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageField } from "@/components/admin/stays/ImageInputs";

type Ctl = Control<StayFormInput>;
type Reg = UseFormRegister<StayFormInput>;

const SELECT =
  "border-input bg-card text-ink focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** The card chrome around one repeated item: reorder + remove controls. */
function ItemCard({
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-paper-2/30 rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="num text-muted-ink text-xs font-medium">
          #{index + 1}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            aria-label="Move up"
            className="text-muted-ink hover:bg-paper-2 hover:text-bark grid size-7 place-items-center rounded disabled:opacity-30"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="text-muted-ink hover:bg-paper-2 hover:text-bark grid size-7 place-items-center rounded disabled:opacity-30"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label="Remove"
            className="text-error hover:bg-error/10 grid size-7 place-items-center rounded"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="mt-1">
      <Plus className="size-4" aria-hidden />
      {label}
    </Button>
  );
}

/** Highlights — a simple tick list of labels, exactly as the stay page shows
 *  them. One text field per line; the icon stays whatever it was. */
export function HighlightsEditor({
  control,
  register,
}: {
  control: Ctl;
  register: Reg;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "highlights",
  });
  return (
    <div className="flex flex-col gap-2">
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-center gap-2">
          <span className="bg-mist/12 text-mist grid size-8 shrink-0 place-items-center rounded-full">
            <Check className="size-4" aria-hidden />
          </span>
          <Input
            className="flex-1"
            placeholder="Free breakfast"
            aria-label={`Highlight ${i + 1}`}
            {...register(`highlights.${i}.label`)}
          />
          <input type="hidden" {...register(`highlights.${i}.icon`)} />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove highlight"
            className="text-error hover:bg-error/10 grid size-8 shrink-0 place-items-center rounded-md"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <AddButton
        label="Add highlight"
        onClick={() => append({ label: "", icon: "" })}
      />
    </div>
  );
}

/** Rooms — name, description, bed type, max guests, image. */
export function RoomsEditor({
  control,
  register,
}: {
  control: Ctl;
  register: Reg;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "rooms",
  });
  return (
    <div className="flex flex-col gap-3">
      {fields.map((f, i) => (
        <ItemCard
          key={f.id}
          index={i}
          count={fields.length}
          onMove={move}
          onRemove={remove}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Room name"
              placeholder="The Estate Room"
              {...register(`rooms.${i}.name`)}
            />
            <Input
              label="Bed type"
              placeholder="1 King bed"
              {...register(`rooms.${i}.bedType`)}
            />
            <Input
              label="Max guests"
              type="number"
              mono
              {...register(`rooms.${i}.maxGuests`)}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                rows={2}
                {...register(`rooms.${i}.description`)}
              />
            </div>
            <div className="sm:max-w-xs">
              <p className="eyebrow text-muted-ink mb-1.5">Room photo</p>
              <Controller
                control={control}
                name={`rooms.${i}.image`}
                render={({ field }) => (
                  <ImageField
                    value={field.value ?? null}
                    onChange={field.onChange}
                    kind="gallery"
                    aspect="aspect-[4/3]"
                  />
                )}
              />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton
        label="Add room"
        onClick={() =>
          append({
            name: "",
            description: "",
            bedType: "",
            maxGuests: 2,
            image: null,
          })
        }
      />
    </div>
  );
}

/** Experiences — title, description, image (id hidden, links a shared Experience). */
export function ExperiencesEditor({
  control,
  register,
}: {
  control: Ctl;
  register: Reg;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experiences",
  });
  return (
    <div className="flex flex-col gap-3">
      {fields.map((f, i) => (
        <ItemCard
          key={f.id}
          index={i}
          count={fields.length}
          onMove={move}
          onRemove={remove}
        >
          <input type="hidden" {...register(`experiences.${i}.id`)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              placeholder="Morning coffee walk"
              {...register(`experiences.${i}.title`)}
            />
            <div />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                rows={2}
                {...register(`experiences.${i}.description`)}
              />
            </div>
            <div className="sm:max-w-xs">
              <p className="eyebrow text-muted-ink mb-1.5">Photo</p>
              <Controller
                control={control}
                name={`experiences.${i}.image`}
                render={({ field }) => (
                  <ImageField
                    value={field.value ?? null}
                    onChange={field.onChange}
                    kind="gallery"
                    aspect="aspect-[4/3]"
                  />
                )}
              />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton
        label="Add experience"
        onClick={() =>
          append({ id: null, title: "", description: "", image: null })
        }
      />
    </div>
  );
}

/** Nearby places — name, category, description, distance, drive time, maps, image. */
export function NearbyEditor({
  control,
  register,
}: {
  control: Ctl;
  register: Reg;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "nearbyPlaces",
  });
  return (
    <div className="flex flex-col gap-3">
      {fields.map((f, i) => (
        <ItemCard
          key={f.id}
          index={i}
          count={fields.length}
          onMove={move}
          onRemove={remove}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Place name"
              placeholder="Mullayanagiri Peak"
              {...register(`nearbyPlaces.${i}.name`)}
            />
            <div>
              <p className="eyebrow text-muted-ink mb-1.5">Category</p>
              <select
                className={SELECT}
                {...register(`nearbyPlaces.${i}.category`)}
              >
                {PLACE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Distance (km)"
              type="number"
              mono
              {...register(`nearbyPlaces.${i}.distanceKm`)}
            />
            <Input
              label="Drive time (min)"
              type="number"
              mono
              {...register(`nearbyPlaces.${i}.driveTimeMinutes`)}
            />
            <Input
              label="Google Maps URL"
              className="sm:col-span-2"
              {...register(`nearbyPlaces.${i}.mapsUrl`)}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                rows={2}
                {...register(`nearbyPlaces.${i}.description`)}
              />
            </div>
            <div className="sm:max-w-xs">
              <p className="eyebrow text-muted-ink mb-1.5">Photo</p>
              <Controller
                control={control}
                name={`nearbyPlaces.${i}.image`}
                render={({ field }) => (
                  <ImageField
                    value={field.value ?? null}
                    onChange={field.onChange}
                    kind="gallery"
                    aspect="aspect-[4/3]"
                  />
                )}
              />
            </div>
          </div>
        </ItemCard>
      ))}
      <AddButton
        label="Add place"
        onClick={() =>
          append({
            name: "",
            category: "VIEWPOINT",
            description: "",
            distanceKm: null,
            driveTimeMinutes: null,
            mapsUrl: "",
            image: null,
          })
        }
      />
    </div>
  );
}
