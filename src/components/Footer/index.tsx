/* 
 *************************************
 * <!-- Footer -->
 *************************************
 */
import appInfo from "@/data/app.json";

export default function Footer() {
    return (
        <>
            <footer className="clearfix">
               <p dangerouslySetInnerHTML={{__html: appInfo.copyright}}/>
            </footer>

        </>
    )
}

