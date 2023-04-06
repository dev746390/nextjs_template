import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';



const MainContent = (props) => {
    return (
        <>
              <ul>
                <li>
                  <Link href={`/nested-routes/${props.data}/first-comment.html`}>
                    First comment
                  </Link>
                </li>
                <li>
                  <Link href={`/nested-routes/${props.data}/second-comment.html`}>
                     Second comment
                  </Link>
                </li>
              </ul>

        </>
    )

};


/** Render data
 * ---------------------------------
*/
const NestedRoutesChild = () => {

    const router = useRouter();
    const id = router.query.id as string;
    const idShow = id.replace('.html', '')

    return (
        <>
            <Head>
                <title>{idShow}</title>
            </Head>

            <Layout
                pageTitle={idShow}
                contentComponent={<><MainContent data={idShow} /></>}
            />


        </>
    )
};




/** This gets called on every request 
 * ---------------------------------
*/
export async function getStaticPaths() {

    if (process.env.SKIP_BUILD_STATIC_GENERATION) {
        return {
            paths: [],
            fallback: 'blocking',
        }
    }


    //
    //--------
    return {
        // String variant: paths must match the dynamic route shape.
        paths: [
            '/nested-routes/first.html',
            '/nested-routes/second.html'
        ],
        // We'll pre-render only these paths at build time.
        fallback: 'blocking'
    }
}


export async function getStaticProps() {
    return {
        props: {},
        
        // Incremental Static Regeneration. (Next.js will attempt to re-generate the page:)
        revalidate: 10, // In seconds 
    }  
}


export default NestedRoutesChild;

