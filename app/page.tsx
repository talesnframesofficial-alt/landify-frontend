"use client";

import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Featured from "../components/Featured";
import Latest from "../components/Latest";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <Latest />
    </>
  );
}
