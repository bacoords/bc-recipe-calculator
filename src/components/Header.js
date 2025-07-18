import { Flex } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function Header({ children }) {
  return (
    <div
      style={{
        padding: "1rem",
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
