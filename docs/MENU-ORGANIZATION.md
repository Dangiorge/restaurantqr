# Dietary filters and category groups

In Workspace → Menus, add or edit a dish and select its **Dietary type**: Vegan, Non-vegan, or Not specified. Existing dishes remain Not specified until staff classify them. Additional dietary labels and allergens remain separate fields. The workspace list can filter by all three classifications.

Guests can combine Vegan or Non-vegan with category navigation and dish search. Unclassified dishes appear under All and are excluded from the Vegan and Non-vegan filters. Changing a filter does not clear the cart. Classified dishes show their dietary type on the card and in the detail view.

Add or edit a category and select a **Parent category** in the same menu. Leave the parent empty for a top-level category. Two levels are supported, such as Traditional Food → Stews. Dish category choices display the full path. Guest navigation shows top-level categories first, then their child categories. Selecting a parent includes its own dishes and all child dishes.

Cross-restaurant and cross-menu parents are rejected. A category cannot parent itself or form a cycle; category writes are serialized per restaurant to protect concurrent edits. Move children first before moving a parent to another menu or making it a child. Hiding a parent also hides its child categories from public menus and prevents ordering their dishes.

Migration `20261019170000_menu_taxonomy` adds the dietary enum and nullable category parent with a composite foreign key. It preserves existing dishes, prices, labels, and category assignments. The migration was backed up and restore-tested before application to the verified application database. For a separate database, apply the checked-in migrations with Prisma Migrate before deploying the new client. Schema migrations should use a direct database connection; runtime traffic can remain pooled.
