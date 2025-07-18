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
 * Test the actual navigation hook behavior
 * This can be run in the browser console
 */
export function testNavigationHook() {
  console.log("🧪 Testing navigation hook behavior...");

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

    // Simulate changing the URL
    const newUrl = window.location.origin + window.location.pathname + url;
    window.history.pushState({}, "", newUrl);

    // Trigger a popstate event to test the navigation hook
    window.dispatchEvent(new PopStateEvent("popstate"));

    console.log("URL changed, check if the correct view is displayed");
  });
}

/**
 * Specific test for the shopping view issue
 */
export function testShoppingViewFix() {
  console.log("🧪 Testing shopping view fix...");

  // Test the specific scenario that was failing
  const shoppingUrl = "?view=shopping";
  console.log(`Testing URL: ${shoppingUrl}`);

  const result = parseUrlParamsForTesting(shoppingUrl);
  const expected = {
    currentView: "shopping",
    editingPostId: null,
    editingTermId: null,
  };

  const passed = JSON.stringify(result) === JSON.stringify(expected);

  if (passed) {
    console.log("✅ Shopping view URL parsing works correctly");
  } else {
    console.log("❌ Shopping view URL parsing failed");
    console.log("Expected:", expected);
    console.log("Got:", result);
  }

  // Test that the URL doesn't redirect to recipes
  console.log("\n🔗 Testing that shopping view stays on shopping...");
  console.log("Navigate to ?view=shopping and verify it stays on shopping tab");
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.testUrlParameterHandling = testUrlParameterHandling;
  window.testNavigationHook = testNavigationHook;
  window.testShoppingViewFix = testShoppingViewFix;
}
