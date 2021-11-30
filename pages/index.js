import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css'
const defaultEndpoint = `https://rickandmortyapi.com/api/character/`;

export async function getServerSideProps() {
  const res = await fetch(defaultEndpoint)
  const data = await res.json();
  return {
    props: {
      data
    }
  }
}

export default function Home({ data }) {
  const { info, results: defaultResults = [] } = data;

  const [results, updateResults] = useState(defaultResults);

  const [page, updatePage] = useState({
    ...info,
    current: defaultEndpoint
  });
  const { current } = page;

  useEffect(() => {
    // Don't bother making a request if it's the default endpoint as we
    // received that on the server

    if ( current === defaultEndpoint ) return;

    // In order to use async/await, we need an async function, and you can't
    // make the `useEffect` function itself async, so we can create a new
    // function inside to do just that

    async function request() {
      const res = await fetch(current)
      const nextData = await res.json();

      updatePage({
        current,
        ...nextData.info
      });

      // If we don't have `prev` value, that means that we're on our "first page"
      // of results, so we want to replace the results and start fresh

      if ( !nextData.info?.prev ) {
        updateResults(nextData.results);
        return;
      }

      // Otherwise we want to append our results

      updateResults(prev => {
        return [
          ...prev,
          ...nextData.results
        ]
      });
    }

    request();
  }, [current]);

  function handleLoadMore() {
    updatePage(prev => {
      return {
        ...prev,
        current: page?.next
      }
    });
  }

  function handleOnSubmitSearch(e) {
    e.preventDefault();

    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find(field => field.name === 'query');

    const value = fieldQuery.value || '';
    const endpoint = `https://rickandmortyapi.com/api/character/?name=${value}`;

    updatePage({
      current: endpoint
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <motion.div initial="hidden" animate="visible" variants={{
          hidden: {
            scale: .8,
            opacity: 0
          },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              delay: .4
            }
          },
        }}>
          <h1 className={styles.title}>
            Wubba Lubba Dub Dub!
          </h1>
        </motion.div>

        <p className={styles.description}>
          Rick and Morty Character Wiki
        </p>

        <form className={styles.search} onSubmit={handleOnSubmitSearch}>
          <input name="query" type="search" />
          <button>Search</button>
        </form>

        <ul className={styles.grid}>
          {results.map(result => {
            const { id, name, image } = result;
            return (
              <motion.li key={id} className={styles.card} whileHover={{
                position: 'relative',
                zIndex: 1,
                background: 'white',
                scale: [1, 1.4, 1.2],
                rotate: [0, 10, -10, 0],
                filter: [
                  'hue-rotate(0) contrast(100%)',
                  'hue-rotate(360deg) contrast(200%)',
                  'hue-rotate(45deg) contrast(300%)',
                  'hue-rotate(0) contrast(100%)'
                ],
                transition: {
                  duration: .2
                }
              }}>
                <Link href="/character/[id]" as={`/character/${id}`}>
                  <a>
                    <img src={image} alt={`${name} Thumbnail`} />
                    <h3>{ name }</h3>
                  </a>
                </Link>
              </motion.li>
            )
          })}
        </ul>

        <p>
          <button onClick={handleLoadMore}>Load More</button>
        </p>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>


    </div>
  )
}