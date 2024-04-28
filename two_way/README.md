# Two-way Translation Test

1. Take an unseen passage.
2. Ask the model to translate it into e.g. Japanese.
3. Azure Translator it back into English.
4. Embed that translation, and calculate cosine similarity with the original.
5. Take the same passage translated into Japanese by Azure.
6. Ask the model to translate it into English.
7. Embed that translation, and calculate cosine similarity with the Azure translation.

You then get, for example:

```
{
“en_to_ja”: 0.98
“ja_to_en”: 0.97
}
```

For this test, I'm using OpenAI's `text-embedding-3-small` model for embeddings.

This test assumes that the model speaks English, so it can't be considered comprehensive. But it is a good indicator of whether a model is proficient in a given non-English language. It also assumes that Azure translator has a quality floor.
