"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

type Identifiable = { id: string };

type SortableReturn = ReturnType<typeof useSortable>;

type HandleProps = {
  attributes: SortableReturn["attributes"];
  listeners: SortableReturn["listeners"];
  isDragging: boolean;
};

function Row({
  id,
  children,
}: {
  id: string;
  children: (handle: HandleProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

/**
 * Generic vertical drag-and-drop list. Calls `onReorder` with the new id
 * order after a drop. The render prop receives a `handle` you spread onto a
 * drag handle element.
 */
export default function SortableList<T extends Identifiable>({
  items,
  onReorder,
  renderItem,
  className = "space-y-3",
  grid = false,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, handle: HandleProps) => ReactNode;
  className?: string;
  /** Free 2D movement (for grid layouts) instead of vertical-only. */
  grid?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    onReorder(next.map((i) => i.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={grid ? [restrictToParentElement] : [restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <Row key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/** Standard drag handle button used by sortable rows. */
export function DragHandle({ handle }: { handle: HandleProps }) {
  return (
    <button
      type="button"
      className="cursor-grab touch-none rounded-lg px-2 py-1 text-ink/40 transition hover:bg-rose-soft/50 hover:text-rose-deep active:cursor-grabbing dark:text-nightink/40"
      aria-label="Réordonner (glisser)"
      {...handle.attributes}
      {...(handle.listeners ?? {})}
    >
      ⠿
    </button>
  );
}
