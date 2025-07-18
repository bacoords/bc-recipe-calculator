import { parseUrlParamsForTesting, testCases } from "./navigation";

/**
 * Simple test function to verify URL parameter handling
 * This can be run in the browser console for testing
 */
export function testUrlParameterHandling() {
  console.log("🧪 Testing URL parameter handling...");

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);

    try {
      const result = parseUrlParamsForTesting(testCase.url);
      const passed =
        JSON.stringify(result) === JSON.stringify(testCase.expected);

      if (passed) {
        console.log("✅ PASSED");
        passedTests++;
      } else {
        console.log("❌ FAILED");
        console.log("Expected:", testCase.expected);
        console.log("Got:", result);
      }
    } catch (error) {
      console.log("❌ ERROR:", error.message);
    }
  });

  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All tests passed! URL parameter handling is working correctly."
    );
  } else {
    console.log("⚠️  Some tests failed. Please check the implementation.");
  }
}

/**
 * Test the simplified navigation hook behavior
 */
export function testSimplifiedNavigation() {
  console.log("🧪 Testing simplified navigation...");

  // Test URL changes
  const testUrls = [
    "?",
    "?view=recipes",
    "?view=ingredients",
    "?view=shopping",
    "?edit=123",
    "?edit_ingredient=456&view=ingredients",
  ];

  testUrls.forEach((url, index) => {
    console.log(`\n🔗 Test URL ${index + 1}: ${url}`);
    console.log("Navigate to this URL and verify the correct view loads");
  });

  console.log("\n📝 Instructions:");
  console.log("1. Navigate to each URL above");
  console.log("2. Verify the correct tab is selected");
  console.log("3. Verify the correct content is displayed");
  console.log("4. Test browser back/forward buttons");
}

/**
 * Debug current navigation state
 */
export function debugNavigationState() {
  console.log("🔍 Current navigation state:");
  console.log("URL:", window.location.href);
  console.log("Search params:", window.location.search);

  const urlParams = new URLSearchParams(window.location.search);
  console.log("view param:", urlParams.get("view"));
  console.log("edit param:", urlParams.get("edit"));
  console.log("edit_ingredient param:", urlParams.get("edit_ingredient"));
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testUrlParameterHandling = testUrlParameterHandling;
  window.testSimplifiedNavigation = testSimplifiedNavigation;
  window.debugNavigationState = debugNavigationState;
}
