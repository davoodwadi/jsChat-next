"use client";

import { useState, useEffect } from "react";
import MarkdownComponent from "@/components/MarkdownComponent";

export default function TestDeepResearchPage() {
  const [sampleContent, setSampleContent] = useState("");
  const [sampleAnnotations, setSampleAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sample markdown and annotations
    Promise.all([
      fetch("/sample-google-deep-research.md").then((r) => r.text()),
      fetch("/sample-annotations-google-deep-research.json").then(
        (r) => r.json(),
      ),
    ])
      .then(([markdown, annotations]) => {
        setSampleContent(markdown);
        setSampleAnnotations(annotations);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load sample data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading sample Deep Research content...</p>
      </div>
    );
  }

  // Mock props structure for the MarkdownComponent
  const mockProps = {
    botMessage: {
      content: sampleContent,
      role: "assistant",
    },
    annotations: sampleAnnotations,
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Deep Research Citation Test
          </h1>
          <p className="text-muted-foreground mb-2">
            This page demonstrates the enhanced Deep Research citation rendering
            with clickable inline citations and an improved references section.
          </p>
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">Features to test:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Click on inline citations (e.g., <sup>[1]</sup>) to scroll to
                the reference
              </li>
              <li>Observe the highlight animation on the citation card</li>
              <li>
                Check the enhanced citation cards with favicons and metadata
              </li>
              <li>Verify smooth scroll behavior</li>
              <li>Test dark mode toggle (if available)</li>
            </ul>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-md">
          <MarkdownComponent mode="gemini" props={mockProps}>
            {sampleContent}
          </MarkdownComponent>
        </div>
      </div>
    </div>
  );
}
