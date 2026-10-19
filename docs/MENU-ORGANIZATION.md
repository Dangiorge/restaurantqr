# Dietary filters and category groups

Guests now enter through a welcome screen using the original transparent Romina SVG. **View Menu** opens daily recommendations, optional event posters, and the parent-category list. Selecting a parent opens its dishes in a vertical list, with child-category and dietary filters. **View more** opens the full dish details, quantity selector, and special instructions. Dish instructions are preserved in the cart and included by dish name in the order sent to staff. The red **More** button at the bottom right expands left to reveal menu, order, waiter, bill, water and help actions. Public visitors receive a table-scan explanation when requesting table service. The drawer closes with Escape, an outside click, or an action selection; its hidden controls are not focusable.

Workspace → Menus → **Guest welcome & discovery** manages the welcome background, up to 12 recommended dishes, and event posters with titles, details, publication switches and optional show/hide dates. Unavailable or hidden dishes are omitted from recommendations. When recommendations have not been selected, the carousel is labelled Explore our menu and shows available dishes. Unpublished, future and expired events are skipped. The carousel has manual navigation and pause controls, and does not auto-advance for reduced-motion users.

Migration `20261019190000_guest_discovery` adds one optional JSON settings column. No sample events or menu items are inserted into the application database.

In Workspace → Menus, add or edit a dish and select its **Dietary type**: Vegan, Non-vegan, or Not specified. Existing dishes remain Not specified until staff classify them. Additional dietary labels and allergens remain separate fields. The workspace list can filter by all three classifications.

Guests can combine Vegan or Non-vegan with category navigation and dish search. Unclassified dishes appear under All and are excluded from the Vegan and Non-vegan filters. Changing a filter does not clear the cart. Classified dishes show their dietary type on the card and in the detail view.

Add or edit a category and select a **Parent category** in the same menu. Leave the parent empty for a top-level category. Two levels are supported, such as Traditional Food → Stews. Dish category choices display the full path. Guest navigation shows top-level categories first, then their child categories. Selecting a parent includes its own dishes and all child dishes.

Cross-restaurant and cross-menu parents are rejected. A category cannot parent itself or form a cycle; category writes are serialized per restaurant to protect concurrent edits. Move children first before moving a parent to another menu or making it a child. Hiding a parent also hides its child categories from public menus and prevents ordering their dishes.

Migration `20261019170000_menu_taxonomy` adds the dietary enum and nullable category parent with a composite foreign key. It preserves existing dishes, prices, labels, and category assignments. The migration was backed up and restore-tested before application to the verified application database. For a separate database, apply the checked-in migrations with Prisma Migrate before deploying the new client. Schema migrations should use a direct database connection; runtime traffic can remain pooled.
