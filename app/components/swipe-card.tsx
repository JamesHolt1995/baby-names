"use client";

import { useCallback, useState } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	type PanInfo,
} from "motion/react";
import { Button } from "./button";
import { Badge } from "./badge";
import { GenderBadge } from "./gender-badge";
import { Heading } from "./heading";
import { PopularToggle } from "./popular-toggle";
import { Text, TextLink } from "./text";
import type { Gender } from "@/lib/db/schema";

export type SwipeAction = "veto" | "shortlist" | "love";

export type QueueCard = {
	id: number;
	name: string;
	gender: Gender;
	usages: { code: string; full: string }[];
	meaning: string | null;
	meaningUrl: string | null;
	partnerAction: "shortlist" | "love" | null;
};

const SWIPE_THRESHOLD = 120;

export function SwipeDeck({
	initialCard,
	initialPreferPopular,
}: {
	initialCard: QueueCard | null;
	initialPreferPopular: boolean;
}) {
	// The first card is fetched server-side by app/page.tsx and passed in —
	// no fetch-on-mount here, so there's nothing to load before this renders.
	const [card, setCard] = useState<QueueCard | null | undefined>(initialCard);
	const [error, setError] = useState<string | null>(null);

	const loadNext = useCallback(async () => {
		setCard(undefined);
		setError(null);
		try {
			const res = await fetch("/api/queue");
			if (!res.ok) throw new Error("request failed");
			const data = (await res.json()) as { card: QueueCard | null };
			setCard(data.card);
		} catch {
			setError(
				"Could not load the next name — check your connection and try again.",
			);
			setCard(null);
		}
	}, []);

	async function act(action: SwipeAction) {
		if (!card) return;
		const nameId = card.id;
		setCard(undefined);
		try {
			await fetch("/api/swipe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nameId, action }),
			});
		} finally {
			loadNext();
		}
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex justify-center border-b border-zinc-950/10 p-4 dark:border-white/10">
				<PopularToggle initialValue={initialPreferPopular} />
			</div>

			{card === undefined && (
				<div className="flex flex-1 items-center justify-center">
					<Text>Loading...</Text>
				</div>
			)}

			{card !== undefined && error && (
				<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
					<Text>{error}</Text>
					<Button onClick={loadNext}>Try again</Button>
				</div>
			)}

			{card !== undefined && !error && card === null && (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
					<Heading>You&rsquo;re all caught up!</Heading>
					<Text>
						No new names right now — check back later, or add one yourself on
						&ldquo;My Names&rdquo;.
					</Text>
				</div>
			)}

			{card !== undefined && !error && card && (
				<SwipeCard key={card.id} card={card} onAct={act} />
			)}
		</div>
	);
}

function SwipeCard({
	card,
	onAct,
}: {
	card: QueueCard;
	onAct: (action: SwipeAction) => void;
}) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-15, 15]);
	const vetoOpacity = useTransform(x, [-150, -40, 0], [1, 0, 0]);
	const shortlistOpacity = useTransform(x, [0, 40, 150], [0, 0, 1]);
	const loveOpacity = useTransform(y, [-150, -40, 0], [1, 0, 0]);

	function handleDragEnd(_: unknown, info: PanInfo) {
		const { x: dx, y: dy } = info.offset;
		if (dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
			onAct("love");
		} else if (dx > SWIPE_THRESHOLD) {
			onAct("shortlist");
		} else if (dx < -SWIPE_THRESHOLD) {
			onAct("veto");
		}
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4">
			<motion.div
				drag
				style={{ x, y, rotate }}
				dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
				dragElastic={0.6}
				onDragEnd={handleDragEnd}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				whileDrag={{ scale: 1.03 }}
				className="relative w-full max-w-sm cursor-grab touch-none rounded-2xl border border-zinc-950/10 bg-white p-6 shadow-lg select-none active:cursor-grabbing dark:border-white/10 dark:bg-zinc-900"
			>
				<motion.div
					style={{ opacity: vetoOpacity }}
					className="pointer-events-none absolute top-6 left-6 rounded-md border-2 border-red-500 px-2 py-1 text-sm font-bold tracking-wide text-red-500"
				>
					VETO
				</motion.div>
				<motion.div
					style={{ opacity: shortlistOpacity }}
					className="pointer-events-none absolute top-6 right-6 rounded-md border-2 border-green-600 px-2 py-1 text-sm font-bold tracking-wide text-green-600"
				>
					SHORTLIST
				</motion.div>
				<motion.div
					style={{ opacity: loveOpacity }}
					className="pointer-events-none absolute inset-x-0 top-6 mx-auto w-fit rounded-md border-2 border-pink-500 px-2 py-1 text-sm font-bold tracking-wide text-pink-500"
				>
					LOVE
				</motion.div>

				<div className="flex flex-col items-center gap-3 py-6 text-center">
					<Heading className="text-4xl!">{card.name}</Heading>
					<GenderBadge gender={card.gender} />

					{card.partnerAction && (
						<Badge color="violet">
							Your partner{" "}
							{card.partnerAction === "love" ? "loved" : "shortlisted"} this
						</Badge>
					)}

					{card.meaning && (
						<div className="flex flex-col items-center gap-1">
							<Text className="line-clamp-4">{card.meaning}</Text>
							{card.meaningUrl && (
								<TextLink
									href={card.meaningUrl}
									target="_blank"
									rel="noreferrer"
									className="text-xs"
								>
									Read more on Wikipedia →
								</TextLink>
							)}
						</div>
					)}

					{card.usages.length > 0 && (
						<div className="flex flex-wrap justify-center gap-1.5">
							{card.usages.map((usage) => (
								<Badge key={usage.code}>{usage.full}</Badge>
							))}
						</div>
					)}
				</div>
			</motion.div>

			<div className="flex gap-3">
				<Button color="red" onClick={() => onAct("veto")}>
					✕ Veto
				</Button>
				<Button color="green" onClick={() => onAct("shortlist")}>
					♡ Shortlist
				</Button>
				<Button color="pink" onClick={() => onAct("love")}>
					♥ Love
				</Button>
			</div>
			<Text className="text-xs">
				Swipe left to veto, right to shortlist, up to love — or use the buttons.
			</Text>
		</div>
	);
}
