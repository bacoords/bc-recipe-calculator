import { Flex } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function Header({ children }) {
  return (
    <div
      style={{
        padding: "1rem",
        marginBottom: "1rem",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{
          gap: "1rem",
        }}
      >
        <h1>{__("Recipe Calculator", "bc-recipe-calculator")}</h1>
        {children}
      </Flex>
    </div>
  );
}

export default Header;
