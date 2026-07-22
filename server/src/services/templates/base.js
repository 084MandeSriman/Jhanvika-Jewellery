// Shared wrapper so every email matches the Jhanvika brand look.
export function baseTemplate(title, bodyHtml) {
  return `
  <div style="font-family: Georgia, serif; background: #FBF6EC; padding: 32px; color: #20140f;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #F3EAD8;">
      <div style="background: #2e0f0c; padding: 24px; text-align: center;">
        <span style="color: #E9C363; font-size: 24px; letter-spacing: 2px;">JHANVIKA</span>
        <div style="color: #f3dd9c; font-size: 10px; letter-spacing: 4px; margin-top: 4px;">JEWELLERIES</div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #5c1f18; font-weight: 500;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background: #F3EAD8; padding: 16px; text-align: center; font-size: 11px; color: #8a7355;">
        Jhanvika Jewelleries · 14 Kalasha Marg, Jaipur, Rajasthan 302001
      </div>
    </div>
  </div>`;
}
