// External Dependencies
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

// Relative Dependencies
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
  Facebook = "oauth_facebook",
}

const Page = () => {
  useWarmUpBrowser();

  const router = useRouter();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: facebookAuth } = useOAuth({
    strategy: "oauth_facebook",
  });

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
      [Strategy.Facebook]: facebookAuth,
    }[strategy];

    try {
      const { createdSessionId, setActive } = await selectedAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.back();
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <View style={stylesheet.container}>
      <TextInput
        style={[stylesheet.inputField, { marginBottom: 20 }]}
        autoCapitalize="none"
        placeholder="Email"
      />
      <TextInput
        secureTextEntry={true}
        style={[stylesheet.inputField, { marginBottom: 30 }]}
        autoCapitalize="none"
        placeholder="Password"
      />
      <Pressable style={stylesheet.btn}>
        <Text style={stylesheet.btnText}>Sign In</Text>
      </Pressable>

      <View style={stylesheet.seperatorView}>
        <View
          style={{
            flex: 1,
            borderBottomColor: "black",
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />
        <Text style={stylesheet.seperator}>or</Text>
        <View
          style={{
            flex: 1,
            borderBottomColor: "black",
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        />
      </View>

      <View>
        <Pressable
          className="mb-4"
          style={stylesheet.btnOutline}
          onPress={() => onSelectAuth(Strategy.Apple)}
        >
          <Ionicons name="md-logo-apple" size={24} style={stylesheet.btnIcon} />
          <Text style={stylesheet.btnOutlineText}>Continue with Apple</Text>
        </Pressable>

        <Pressable
          style={[stylesheet.btnOutline, { marginBottom: 20 }]}
          onPress={() => onSelectAuth(Strategy.Google)}
        >
          <Ionicons
            name="md-logo-google"
            size={24}
            style={stylesheet.btnIcon}
          />
          <Text style={stylesheet.btnOutlineText}>Continue with Google</Text>
        </Pressable>
      </View>
      <View className="flex flex-row justify-center">
        <Text className="align-center mr-2 justify-center">
          Don't have an account?
        </Text>
        <Pressable onPress={() => router.push("/(modals)/signUp")}>
          <Text className="font-semibold underline">Sign up for free</Text>
        </Pressable>
      </View>
    </View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#FDFFFF",
    padding: 26,
  },
  seperatorView: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  seperator: {
    color: "#5E5D5E",
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ABABAB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: "#FF385C",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
  },
  btnIcon: {
    position: "absolute",
    left: 16,
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#5E5D5E",
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#000",
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    height: 100,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: "#5E5D5E",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default Page;
