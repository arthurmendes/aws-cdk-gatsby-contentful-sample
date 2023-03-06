import * as React from "react";
import { graphql } from "gatsby";
import { renderRichText } from "gatsby-source-contentful/rich-text";
import { INLINES } from "@contentful/rich-text-types";

const IndexPage = ({ data }) => {
    const options = {
        renderNode: {
            [INLINES.HYPERLINK]: (node, children) => {
                const { uri } = node.data;

                return <a href={uri}>{children}</a>;
            },
        },
    };

    return (
        <main>
            <h1>Contentful</h1>

            {data &&
                data.allContentfulPage?.nodes?.map((page, index) => {
                    console.log(page);
                    return (
                        <article key={index}>
                            <h2>{page.title}</h2>
                            <div>
                                {renderRichText(
                                    { raw: page.richTextContent.raw },
                                    options
                                )}
                            </div>
                        </article>
                    );
                })}
        </main>
    );
};

export const query = graphql`
    query ContentfulPage {
        allContentfulPage {
            nodes {
                __typename
                contentful_id
                title
                richTextContent {
                    raw
                }
            }
        }
    }
`;

export default IndexPage;

export const Head = () => <title>Home Page</title>;
