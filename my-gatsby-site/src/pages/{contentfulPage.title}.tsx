import * as React from "react"
import { graphql } from "gatsby"

// markup
const Page = ({ data }) => {
  return (
    <main>
      <title>{data.contentfulPage.title}</title>
      <div dangerouslySetInnerHTML={{
        __html: data.contentfulPage.description.childMarkdownRemark.html
      }}></div>
    </main>
  )
}

export const data = graphql`
  query pageQuery($id: String) {
    contentfulPage(id: {eq: $id}) {
      title
      description {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`

export default Page
