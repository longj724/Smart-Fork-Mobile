// External Dependencies
import { View, Text, Pressable } from "react-native";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";

const Page = () => {
  const { getToken, userId } = useAuth();

  const { mutate: submitQuestion } = useMutation({
    mutationFn: async (question: string) => {
      const supabaseAccessToken = await getToken({
        template: "supabase",
      });

      const data = {
        question,
        userId,
      };

      return axios.post("http://localhost:3000/insights/ask-question", data, {
        headers: {
          Authorization: supabaseAccessToken,
        },
      });
    },
    mutationKey: ["askQuestion"],
  });

  return (
    <View>
      <Pressable
        className="w-20 h-10 bg-green-700"
        onPress={() =>
          submitQuestion(
            "What have I eaten over the last few days and what should I look to add to my diet?"
          )
        }
      >
        <Text>Submit Question Test</Text>
      </Pressable>
    </View>
  );
};

export default Page;
