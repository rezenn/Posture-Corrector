import pandas as pd

# Sample posture data [shoulder, neck, spine, symmetry, label]
data = [
    [90, 30, 160, 5, "good"],
    [85, 25, 150, 7, "good"],
    [60, 20, 120, 20, "poor"],
    [70, 15, 130, 18, "poor"],
    [88, 32, 165, 4, "good"],
    [55, 10, 100, 25, "poor"],
    [92, 28, 170, 3, "good"],
    [65, 19, 135, 22, "poor"],
    [80, 27, 155, 6, "good"],
    [58, 13, 125, 19, "poor"]
]

# Save to CSV
df = pd.DataFrame(
    data, columns=["shoulder", "neck", "spine", "symmetry", "label"])
df.to_csv("posture_data.csv", index=False)
print("✅ Dataset saved as posture_data.csv")
