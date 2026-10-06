#!/bin/bash
set -e

declare -A commit_msgs=(
  ["package.json"]="build: update dependencies"
  ["pnpm-lock.yaml"]="build: update lockfile"
  ["src/assets/sidebar_icons/CustomerIcon.svg"]="feat: add customer sidebar icon"
  ["src/components/FilterTabs.tsx"]="feat: add FilterTabs component"
  ["src/components/common_components/SidePanel.tsx"]="feat: update SidePanel component"
  ["src/components/layout/main-layout.tsx"]="feat: update MainLayout component"
  ["src/components/profile-card.tsx"]="feat: add ProfileCard component"
  ["src/components/ui/dialog.tsx"]="feat: add Dialog component"
  ["src/components/ui/input-group.tsx"]="feat: add InputGroup component"
  ["src/components/ui/table.tsx"]="feat: add Table component"
  ["src/config/navigation.config.ts"]="feat: update navigation configuration"
  ["src/modules/customers/customer-utils.ts"]="feat: add customer utility functions"
  ["src/modules/customers/types.ts"]="feat: add customer types"
  ["src/pages/MarginAnalysisPage.tsx"]="feat: add MarginAnalysisPage"
  ["src/pages/ProjectBudgetDetailsPage.tsx"]="feat: add ProjectBudgetDetailsPage"
  ["src/pages/customers/CustomerDetailPage.tsx"]="feat: add CustomerDetailPage"
  ["src/pages/customers/CustomerProjectFlowPage.tsx"]="feat: add CustomerProjectFlowPage"
  ["src/pages/customers/CustomerProjectsPage.tsx"]="feat: add CustomerProjectsPage"
  ["src/pages/customers/CustomersPage.tsx"]="feat: add CustomersPage"
  ["src/pages/customers/contract-detail.tsx"]="feat: add contract detail component"
  ["src/pages/customers/customer-detail/project-bom.tsx"]="feat: add project BOM component"
  ["src/pages/customers/customer-detail/project-details.tsx"]="feat: add project details component"
  ["src/pages/customers/customer-detail/project-invoices.tsx"]="feat: add project invoices component"
  ["src/pages/customers/customer-detail/project-payments.tsx"]="feat: add project payments component"
  ["src/pages/customers/customer-detail/project-quotation.tsx"]="feat: add project quotation component"
  ["src/pages/customers/customer-detail/projects-table.tsx"]="feat: add projects table component"
  ["src/redux/api/customerApi.ts"]="feat: add customer API service"
  ["src/redux/store.ts"]="feat: register customerApi in Redux store"
  ["src/routes.tsx"]="feat: configure customer and margin analysis routes"
)

# Read all modified and untracked files
git status --porcelain -uall | while read -r status file; do
  msg="${commit_msgs[$file]}"
  if [ -z "$msg" ]; then
    msg="feat: update $(basename "$file")"
  fi
  echo "Committing $file with message: '$msg'"
  git add "$file"
  git commit -m "$msg" -- "$file"
done
