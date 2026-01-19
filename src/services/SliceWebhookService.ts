import axios from "axios";

export class SliceWebhookService {
  private webhookUrls = process.env.SLICE_WEBHOOK_URLS?.split(",") || [
    "http://localhost:3000/api/webhooks/slices",
  ];

  private webhookSecret = process.env.WEBHOOK_SECRET || "your-secret-key";

  async notifySliceCreated(slice: any) {
    return this.sendWebhook("slice.created", slice);
  }

  async notifySliceUpdated(slice: any) {
    return this.sendWebhook("slice.updated", slice);
  }

  async notifySliceDeleted(sliceType: string) {
    return this.sendWebhook("slice.deleted", { sliceType });
  }

  private async sendWebhook(event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    const promises = this.webhookUrls.map((url) =>
      axios
        .post(url, payload, {
          headers: {
            "x-webhook-secret": this.webhookSecret,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(`✅ Webhook sent to ${url}: ${event}`);
          return response;
        })
        .catch((error) => {
          console.error(`❌ Webhook failed for ${url}:`, error.message);
          // Log full error for debugging
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
          }
        })
    );

    return Promise.all(promises);
  }
}
