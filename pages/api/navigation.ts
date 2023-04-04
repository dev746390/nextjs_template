import type { NextApiRequest, NextApiResponse } from 'next'


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    res.status(200).send({
        "data": [
            {
                title: "Home",
                icon: false,
                link: "/"
            },
            {
                title: "About",
                icon: false,
                link: "/about.html"
            },
            {
                title: "Nested Routes",
                icon: false,
                link: "/nested-routes.html"
            },
            {
                title: "Posts",
                icon: false,
                link: "/posts.html"
            },
            {
                title: "Pagination",
                icon: false,
                link: "/pagination/1.html"
            },
            {
                title: "Sign In",
                icon: false,
                link: "/sign-in.html"
            },
            {
                title: "Dashboard",
                icon: false,
                link: "/dashboard/index.html"
            }
        ],
        "message": "OK",
        "code": 200
    })
}



