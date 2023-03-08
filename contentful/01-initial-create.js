module.exports = function (migration) {
    // create Page

    const Page = migration
        .createContentType("Page")
        .name("Page")
        .description("Page structure for Gatsby website projects")
        .displayField("entryTitle");

    // create Page fields

    Page.createField("entryTitle")
        .name("Entry Title")
        .type("Symbol")
        .required(true);

    Page.createField("slug")
        .name("Slug")
        .type("Symbol")
        .required(true)
        .validations([
            {
                unique: true,
            },
        ]);

    Page.createField("sections")
        .name("Sections")
        .type("Array")
        .items({
            type: "Link",
            linkType: "Entry",
            validations: [
                {
                    linkContentType: ["PageSection"],
                },
            ],
        })
        .required(true);

    // change Page field appearance

    Page.changeFieldControl("slug", "builtin", "slugEditor", {
        trackingFieldId: "entryTitle",
    });

    Page.changeFieldControl("sections", "builtin", "entryLinksEditor", {});

    // --------------------

    // create PageSection

    const PageSection = migration
        .createContentType("PageSection")
        .name("Page Section")
        .description("Section structure to be used in Page entries")
        .displayField("entryTitle");

    // create PageSection fields

    PageSection.createField("entryTitle")
        .name("Entry Title")
        .type("Symbol")
        .required(true);

    PageSection.createField("sectionHash")
        .name("Section Hash")
        .type("Symbol")
        .required(true)
        .validations([
            {
                unique: true,
            },
            {
                regexp: { pattern: "^[a-z]+(-[a-z]+)*$" },
            },
        ]);

    // change PageSection field appearance
};
