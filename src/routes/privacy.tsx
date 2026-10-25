import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Chính sách quyền riêng tư — Golden Time" },
      {
        name: "description",
        content:
          "Thông tin về dữ liệu Golden Time thu thập, cách sử dụng, chia sẻ, lưu trữ và cách gửi yêu cầu liên quan đến quyền riêng tư.",
      },
    ],
  }),
  component: PrivacyPage,
});

const sectionClass = "rounded-3xl border border-border bg-white p-6 sm:p-8";
const headingClass = "text-lg font-bold tracking-tight text-foreground sm:text-xl";
const paragraphClass = "mt-3 text-sm leading-7 text-muted-foreground";
const listClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground marker:text-primary";

function PrivacyPage() {
  return (
    <SiteShell>
      <Section className="max-w-4xl">
        <header className="mb-8 rounded-[2rem] bg-cream p-7 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" /> Golden Time
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Chính sách quyền riêng tư
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Chính sách này giải thích cách Golden Time thu thập và sử dụng thông tin khi bạn truy cập website,
            ứng dụng, bản đồ cửa hàng và cổng doanh nghiệp.
          </p>
          <p className="mt-4 text-xs font-medium text-muted-foreground">Cập nhật lần cuối: 26/10/2026</p>
        </header>

        <div className="space-y-5">
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Thông tin chúng tôi xử lý</h2>
            <p className={paragraphClass}>Tùy tính năng bạn sử dụng, Golden Time có thể xử lý các nhóm thông tin sau:</p>
            <ul className={listClass}>
              <li><strong className="text-foreground">Tài khoản:</strong> họ tên, email, số điện thoại nếu bạn cung cấp, thông tin đăng nhập và trạng thái phiên. Mật khẩu được lưu dưới dạng mã băm, không lưu ở dạng văn bản đọc được.</li>
              <li><strong className="text-foreground">Đơn hàng:</strong> tên, số điện thoại, địa chỉ giao hàng, ghi chú, mặt hàng, số lượng, giá trị, phương thức thanh toán và trạng thái đơn.</li>
              <li><strong className="text-foreground">Lượt quét và đánh giá:</strong> ảnh trái cây bạn tải lên, kết quả phân tích, lịch sử quét, điểm sao và nội dung đánh giá. Tên hiển thị có thể xuất hiện cùng đánh giá công khai về cửa hàng.</li>
              <li><strong className="text-foreground">Hồ sơ đối tác:</strong> tên doanh nghiệp, mã số đăng ký, tên người liên hệ, email, số điện thoại, địa chỉ, mật khẩu và giấy phép kinh doanh được tải lên để xét duyệt.</li>
              <li><strong className="text-foreground">Thông tin lưu trên thiết bị:</strong> phiên đăng nhập, giỏ hàng và một số dữ liệu cần thiết để tiếp tục thao tác. Website dùng bộ nhớ trình duyệt và cookie phiên đăng nhập cho các chức năng này.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>2. Vị trí và bản đồ</h2>
            <div className="mt-3 flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Khi bạn mở tab “Bản đồ” và cho phép trình duyệt truy cập vị trí, Golden Time dùng tọa độ để tìm cửa hàng đối tác và các chuỗi ngoài hệ thống được cấu hình trong phạm vi 10 km. Tọa độ được gửi đến máy chủ Golden Time để lấy kết quả; khi tìm sản phẩm gần đây, tọa độ cũng được gửi để trả về kết quả phù hợp. Golden Time không lưu vị trí hiện tại vào hồ sơ của bạn. Bạn có thể từ chối hoặc thu hồi quyền vị trí trong cài đặt trình duyệt.
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Trang bản đồ cửa hàng dùng Leaflet và các ô bản đồ OpenStreetMap. Khi bản đồ hiển thị, trình duyệt tải các ô bản đồ cần xem; máy chủ tile có thể nhận địa chỉ IP và khu vực bản đồ được tải. Khi bạn chủ động tìm địa chỉ hoặc ghim vị trí cửa hàng, nội dung truy vấn hoặc tọa độ được gửi từ backend đến Nominatim. Khi mở bản đồ gần bạn, backend dùng tọa độ để hỏi Overpass API về các cửa hàng trong danh sách; dịch vụ Overpass nhận truy vấn vùng bản đồ và địa chỉ IP của máy chủ. Golden Time lưu địa chỉ và tọa độ bạn xác nhận trong hồ sơ cửa hàng nhưng không lưu vị trí hiện tại của bạn. Xem <a className="font-semibold text-primary underline underline-offset-4" href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">Chính sách quyền riêng tư OpenStreetMap</a>, <a className="font-semibold text-primary underline underline-offset-4" href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" rel="noreferrer">Chính sách sử dụng Nominatim</a>, <a className="font-semibold text-primary underline underline-offset-4" href="https://dev.overpass-api.de/overpass-doc/en/preface/commons.html" target="_blank" rel="noreferrer">Thông tin về Overpass API công cộng</a> và <a className="font-semibold text-primary underline underline-offset-4" href="https://operations.osmfoundation.org/policies/tiles/" target="_blank" rel="noreferrer">Chính sách ô bản đồ OpenStreetMap</a>.
                </p>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>3. Mục đích sử dụng</h2>
            <ul className={listClass}>
              <li>Tạo và bảo vệ tài khoản; cung cấp các chức năng quét trái cây, tra cứu, mua hàng, đánh giá và quản lý cửa hàng.</li>
              <li>Xử lý đơn hàng, chuyển thông tin giao nhận cần thiết cho cửa hàng được chọn và cập nhật trạng thái đơn.</li>
              <li>Gửi ảnh đến nhà cung cấp dịch vụ phân tích AI mà Golden Time cấu hình để tạo kết quả quét; lưu ảnh và kết quả thành lịch sử quét khi phân tích thành công.</li>
              <li>Xét duyệt hồ sơ doanh nghiệp, tạo tài khoản cửa hàng khi hồ sơ được chấp nhận và gửi email thông báo kết quả.</li>
              <li>Duy trì hoạt động, bảo vệ hệ thống, phát hiện lỗi và xử lý yêu cầu hỗ trợ.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>4. Chia sẻ với nhà cung cấp dịch vụ</h2>
            <p className={paragraphClass}>Golden Time chỉ chia sẻ thông tin cần thiết để cung cấp tính năng bạn yêu cầu:</p>
            <ul className={listClass}>
              <li>Cửa hàng nhận đơn có thể xem thông tin người nhận, địa chỉ giao hàng, mặt hàng và ghi chú cần thiết để xử lý đơn.</li>
              <li>Nhà cung cấp AI nhận ảnh trái cây để phân tích. OpenStreetMap nhận yêu cầu tải ô bản đồ, tìm địa chỉ cửa hàng và truy vấn các chuỗi trong bán kính 10 km quanh vị trí hiện tại của bạn.</li>
              <li>Khi tích hợp Gmail API được bật, Golden Time dùng quyền gửi thư để gửi email thông báo kết quả xét duyệt hồ sơ doanh nghiệp. Tích hợp này không dùng để đọc hộp thư của người dùng.</li>
              <li>Nhà cung cấp hạ tầng, cơ sở dữ liệu và lưu trữ xử lý dữ liệu cần thiết để vận hành dịch vụ.</li>
            </ul>
            <p className={paragraphClass}>
              Golden Time không yêu cầu người dùng đăng nhập bằng tài khoản Google trong phiên bản hiện tại. Dữ liệu tài khoản Google của người dùng không được sử dụng để cá nhân hóa quảng cáo.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>5. Lưu trữ và bảo vệ thông tin</h2>
            <p className={paragraphClass}>
              Thông tin được lưu trong cơ sở dữ liệu và hệ thống lưu trữ phục vụ Golden Time. Chúng tôi lưu thông tin trong khoảng thời gian cần thiết để cung cấp dịch vụ, xử lý đơn hàng và hồ sơ đối tác, giải quyết khiếu nại hoặc đáp ứng nghĩa vụ hợp pháp. Một số hồ sơ giao dịch có thể cần được giữ lại sau khi bạn ngừng sử dụng dịch vụ.
            </p>
            <p className={paragraphClass}>
              Chúng tôi áp dụng các biện pháp phù hợp để bảo vệ thông tin, bao gồm mã hóa một chiều mật khẩu và giới hạn quyền truy cập theo vai trò. Không có phương thức truyền hoặc lưu trữ nào bảo đảm an toàn tuyệt đối.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>6. Quyền và lựa chọn của bạn</h2>
            <ul className={listClass}>
              <li>Bạn có thể yêu cầu xem, cập nhật hoặc xóa thông tin cá nhân bằng cách gửi email cho Golden Time.</li>
              <li>Bạn có thể từ chối hoặc thu hồi quyền vị trí trong cài đặt của trình duyệt; tính năng tìm cửa hàng gần bạn khi đó có thể không hoạt động.</li>
              <li>Bạn có thể đăng xuất để kết thúc phiên trên thiết bị đang dùng. Dữ liệu giỏ hàng lưu trong trình duyệt có thể được xóa bằng cách xóa dữ liệu website của trình duyệt.</li>
            </ul>
            <p className={paragraphClass}>
              Để bảo vệ tài khoản, chúng tôi có thể cần xác minh danh tính trước khi xử lý yêu cầu. Một số thông tin có thể được giữ lại khi cần hoàn tất giao dịch, giải quyết tranh chấp hoặc tuân thủ pháp luật.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>7. Thay đổi chính sách và liên hệ</h2>
            <p className={paragraphClass}>
              Chúng tôi có thể cập nhật chính sách khi tính năng hoặc cách xử lý dữ liệu thay đổi. Bản mới sẽ được đăng tại trang này cùng ngày cập nhật.
            </p>
            <a
              href="mailto:nhatdeveloper04@gmail.com?subject=Yeu%20cau%20ve%20quyen%20rieng%20tu%20Golden%20Time"
              className="mt-5 inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              <Mail className="h-4 w-4" /> nhatdeveloper04@gmail.com
            </a>
          </section>
        </div>
      </Section>
    </SiteShell>
  );
}
