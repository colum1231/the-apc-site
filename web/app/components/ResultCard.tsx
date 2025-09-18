import React from "react";

type ResultItem = {
  title?: string;
  answer?: string;
  description?: string;
  metadata?: { type?: string };
};

type Props = {
  item: ResultItem;
};

export default function ResultCard({ item }: Props) {
  return (
    <div
      style={{
        marginBottom: 24,
        padding: 16,
        border: "1px solid white",
        borderRadius: 6,
        color: "white",
      }}
    >
      <h3>{item.title || "Untitled"}</h3>
      <p>{item.answer || item.description || "No answer or description available."}</p>
      <span style={{ fontSize: 12, opacity: 0.7 }}>
        {item.metadata?.type || "Other"}
      </span>
    </div>
  );
}
