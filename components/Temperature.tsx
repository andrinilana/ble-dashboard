import { Text, View } from "./Themed";

const Temperature = ({ temperature }: { temperature: number }) => {
  return (
    <View>
      <Text>{temperature.toFixed(2)}&deg;C</Text>
    </View>
  );
}

export default Temperature;
