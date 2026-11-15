"use client";
export default function ErrorPage({ reset }) {
  return <section><h1>Unable to load this page</h1><p>Please try again shortly.</p><button onClick={reset}>Try again</button></section>;
}
