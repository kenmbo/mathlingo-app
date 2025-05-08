import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch SAT questions via HTTP streaming (NDJSON).
 * Buffers incoming data until newline and parses only complete JSON objects.
 * @param {number} numQuestions - Number of questions to fetch
 * @param {string} difficulty - Difficulty level (e.g., 'easy', 'medium', 'hard')
 * @returns {{ questions: Array, loading: boolean, error: Error|null }}
 */

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export function useStreamedQuestions(numQuestions, difficulty) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStream() {
      setLoading(true);
      setError(null);
      setQuestions([]);

      try {
      const response = await fetch(
      `${API_BASE}/stream_questions?num_questions=${numQuestions}&difficulty=${encodeURIComponent(difficulty)}`
      );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Only split and parse when we have at least one newline
          if (buffer.includes('\n')) {
            const parts = buffer.split('\n');
            buffer = parts.pop();  // leftover for next chunk

            for (const line of parts) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const obj = JSON.parse(trimmed);
                if (!cancelled) {
                  setQuestions(prev => [...prev, obj]);
                }
              } catch (parseErr) {
                console.error('JSON parse error:', parseErr, 'on line:', trimmed);
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStream();
    return () => { cancelled = true; };
  }, [numQuestions, difficulty]);

  return { questions, loading, error };
}

