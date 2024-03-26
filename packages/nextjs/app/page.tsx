"use client";

import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crowdfunding Platform | Bring Your Ideas to Life</title>
      </Head>
      <section
        className="py-16 bg-black min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url('/hero.jpg')` }}
      >
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-8">
          <h1 className="text-5xl font-bold text-white">Bring your ideas to life.</h1>
          <p className="text-xl text-gray-200">Fund your project and connect with a supportive community.</p>
          <div className="flex space-x-4">
            <Link href="/create-project" className="btn btn-primary">
              Start a Project
            </Link>
            <Link href="/browse-projects" className="btn btn-outline btn-accent">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
