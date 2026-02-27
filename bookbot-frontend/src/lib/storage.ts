import { supabase } from "./supabase";

export const uploadBookCover = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("book-covers")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("book-covers")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};