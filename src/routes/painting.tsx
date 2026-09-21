import { createFileRoute, Link } from "@tanstack/react-router";
import { Eraser, Image as ImageIcon, Printer, Save, Share2, Trash2, Undo2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import { usePaceAuth } from "@/lib/pace-auth";
import { familySharingOn, saveCreation, setFamilySharing, shareCreation } from "@/lib/pace-creations";

export const Route = createFileRoute("/painting")({
  head: () => ({
    meta: [
      { title: "Painting — PACE" },
      { name: "description", content: "Paint a picture with big, simple colors and brushes." },
      { property: "og:title", content: "Painting — PACE" },
      { property: "og:description", content: "A calm painting canvas made for older adults." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Painting,
});

const COLORS = [
  { name: "Red", value: "#d64545" },
  { name: "Orange", value: "#e08a2e" },
  { name: "Yellow", value: "#e8c044" },
  { name: "Green", value: "#3f8f5f" },
  { name: "Blue", value: "#2f6fa8" },
  { name: "Purple", value: "#7a5ba6" },
  { name: "Brown", value: "#8a5a3b" },
  { name: "Black", value: "#2b2b33" },
];

const BRUSHES = [
  { name: "Thin", size: 6 },
  { name: "Medium", size: 16 },
  { name: "Thick", size: 34 },
];

function Painting() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const history = useRef<string[]>([]);
  const { user } = usePaceAuth();
  const { status, announce, askStaff, doHere } = useActivityActions("Painting");
  const [color, setColor] = useState(COLORS[4]!.value);
  const [brush, setBrush] = useState(BRUSHES[1]!.size);
  const [erasing, setErasing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [family, setFamily] = useState(false);

  useEffect(() => setFamily(familySharingOn()), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const pointAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    history.current = [...history.current.slice(-11), canvas.toDataURL()];
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = pointAt(event);
    context.beginPath();
    context.moveTo(x, y);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = erasing ? Math.max(24, brush * 2) : brush;
    context.strokeStyle = erasing ? "#fffdf7" : color;
    context.lineTo(x + 0.1, y + 0.1);
    context.stroke();
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const { x, y } = pointAt(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const last = history.current.pop();
    if (!canvas || !context || !last) {
      announce("There is nothing to undo yet.");
      return;
    }
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
    };
    image.src = last;
    announce("Undone.");
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    history.current.push(canvas.toDataURL());
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setConfirmClear(false);
    setSavedId(null);
    announce("Your page is clear. You can start again.");
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !user?.id) return;
    announce("Saving your picture…");
    const created = await saveCreation({
      residentId: user.id,
      kind: "drawing",
      title: `Painting from ${new Date().toLocaleDateString()}`,
      content: canvas.toDataURL("image/png"),
    });
    if (!created) {
      announce("Your picture could not be saved. Please ask staff for help.");
      return;
    }
    setSavedId(created.id);
    doHere("Painted a picture", "Saved to your gallery.");
  };

  const showStaff = async () => {
    if (!savedId) {
      announce("Please save your picture first.");
      return;
    }
    await shareCreation(savedId, { staff: true });
    askStaff("would like to show a painting to staff", "Staff have been told. Someone will come and see your picture.");
  };

  const print = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const page = window.open("", "_blank");
    if (!page) {
      announce("Please allow pop-ups to print your picture.");
      return;
    }
    page.document.write(
      `<title>My painting</title><img src="${canvas.toDataURL("image/png")}" style="max-width:100%" onload="window.print()" />`,
    );
    page.document.close();
    doHere("Printed a painting", "Sending your picture to the printer.");
  };

  const shareFamily = async () => {
    if (!family) {
      announce("Family sharing is turned off. Turn it on below if you would like to share.");
      return;
    }
    if (!savedId) {
      announce("Please save your picture first.");
      return;
    }
    await shareCreation(savedId, { family: true });
    askStaff("would like to send a painting to family", "Your picture will be sent to your family. Staff have been told.");
  };

  return (
    <ActivityShell
      activity="Painting"
      eyebrow="Explore"
      title="Paint a picture"
      lead="Use your finger, a mouse or a stylus. There is no wrong way to paint."
      status={status}
    >
      <div className="paint-tools" role="group" aria-label="Colors">
        {COLORS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`paint-swatch${color === item.value && !erasing ? " is-chosen" : ""}`}
            style={{ backgroundColor: item.value }}
            aria-label={item.name}
            aria-pressed={color === item.value && !erasing}
            onClick={() => {
              setColor(item.value);
              setErasing(false);
              announce(`${item.name} chosen.`);
            }}
          />
        ))}
      </div>
      <div className="paint-tools" role="group" aria-label="Brush size">
        {BRUSHES.map((item) => (
          <Button
            key={item.name}
            size="xl"
            variant={brush === item.size && !erasing ? "default" : "outline"}
            aria-pressed={brush === item.size && !erasing}
            onClick={() => {
              setBrush(item.size);
              setErasing(false);
              announce(`${item.name} brush.`);
            }}
          >
            {item.name}
          </Button>
        ))}
        <Button
          size="xl"
          variant={erasing ? "default" : "outline"}
          aria-pressed={erasing}
          onClick={() => {
            setErasing(!erasing);
            announce(erasing ? "Back to painting." : "Eraser chosen.");
          }}
        >
          <Eraser aria-hidden />
          Eraser
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={560}
        className="paint-canvas"
        aria-label="Painting canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />

      <div className="activity-actions">
        <Button size="xl" variant="outline" onClick={undo}>
          <Undo2 aria-hidden />
          Undo
        </Button>
        <Button size="xl" variant="outline" onClick={() => setConfirmClear(true)}>
          <Trash2 aria-hidden />
          Clear
        </Button>
        <Button size="xl" onClick={() => void save()}>
          <Save aria-hidden />
          Save
        </Button>
      </div>

      {confirmClear && (
        <div className="senior-confirm" role="dialog" aria-label="Clear the page">
          <p>Clear the whole picture? This cannot be undone once you start again.</p>
          <div className="activity-actions">
            <Button size="xl" onClick={clear}>
              Yes, clear it
            </Button>
            <Button size="xl" variant="outline" onClick={() => setConfirmClear(false)}>
              No, keep painting
            </Button>
          </div>
        </div>
      )}

      <div className="activity-actions">
        <Button size="xl" variant="outline" onClick={() => void showStaff()}>
          <Share2 aria-hidden />
          Show my picture to staff
        </Button>
        <Button size="xl" variant="outline" onClick={print}>
          <Printer aria-hidden />
          Print
        </Button>
        <Button size="xl" variant="outline" onClick={() => void shareFamily()}>
          <Users aria-hidden />
          Share with family
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link to="/gallery">
            <ImageIcon aria-hidden />
            My Gallery
          </Link>
        </Button>
      </div>

      <label className="sharing-toggle">
        <input
          type="checkbox"
          checked={family}
          onChange={(event) => {
            setFamilySharing(event.target.checked);
            setFamily(event.target.checked);
            announce(event.target.checked ? "Family sharing is on." : "Family sharing is off.");
          }}
        />
        Allow PACE to share my pictures with my family
      </label>
    </ActivityShell>
  );
}
