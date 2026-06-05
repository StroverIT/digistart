-- previewSlug stores template category/id (e.g. clothing/1) and is not globally unique
-- once each order has its own TenantProject.
DROP INDEX IF EXISTS "TenantProject_previewSlug_key";
