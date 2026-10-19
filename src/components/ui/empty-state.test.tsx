import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderOpen } from "lucide-react";
import { EmptyState } from "./empty-state";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("EmptyState", () => {
  it("renders title, description, and value line", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Projects you create will show up here."
        value="Track budgets and clients in one place."
        action={{ label: "New project", onClick: () => undefined }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "No projects yet" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Projects you create will show up here.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Track budgets and clients in one place.")
    ).toBeInTheDocument();
  });

  it("omits value line when value is not provided", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Projects you create will show up here."
        action={{ label: "New project", onClick: () => undefined }}
      />
    );

    expect(
      screen.queryByText("Track budgets and clients in one place.")
    ).not.toBeInTheDocument();
  });

  it("calls primary action onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Start here."
        action={{ label: "New project", onClick }}
      />
    );

    await user.click(screen.getByRole("button", { name: "New project" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders href action as a link", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Start here."
        action={{ label: "Go to catalog", href: "/veta-app/catalog" }}
      />
    );

    const link = screen.getByRole("link", { name: "Go to catalog" });
    expect(link).toHaveAttribute("href", "/veta-app/catalog");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows only one primary CTA and optional secondary", () => {
    render(
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Start here."
        action={{ label: "New project", onClick: () => undefined }}
        secondaryAction={{
          label: "Learn more",
          href: "/docs",
        }}
      />
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Learn more" })
    ).toBeInTheDocument();
  });

  it("passes data-onboarding-target through", () => {
    const { container } = render(
      <EmptyState
        icon={FolderOpen}
        title="No clients"
        description="Add your first client."
        action={{ label: "New client", onClick: () => undefined }}
        data-onboarding-target="client"
      />
    );

    expect(
      container.querySelector('[data-onboarding-target="client"]')
    ).toBeInTheDocument();
  });

  it("uses inline variant without dashed card chrome", () => {
    const { container } = render(
      <EmptyState
        variant="inline"
        icon={FolderOpen}
        title="Empty catalog"
        description="Add products first."
        action={{ label: "Create product", onClick: () => undefined }}
      />
    );

    expect(container.querySelector(".border-dashed")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Empty catalog" })
    ).toBeInTheDocument();
  });
});
