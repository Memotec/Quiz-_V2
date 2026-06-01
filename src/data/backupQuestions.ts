// Static backup questions decoded from Google Sheets
export interface Question {
  id: string;
  stt: number;
  category: string;
  title: string;
  options: { key: string; text: string }[];
  answer: string;
}

export const backupQuestions: Question[] = [
  {
    "id": "q-1",
    "stt": 1,
    "category": "TCP/IP Căn bản",
    "title": "Giao thức của bộ giao thức TCP/IP có mấy lớp tầng",
    "options": [
      {
        "key": "a",
        "text": "1 tầng"
      },
      {
        "key": "b",
        "text": "2 tầng"
      },
      {
        "key": "c",
        "text": "3 tầng"
      },
      {
        "key": "d",
        "text": "4 tầng"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-2",
    "stt": 2,
    "category": "TCP/IP Căn bản",
    "title": "Các chương trình như HTTP, SMTP, SNMP, FTP… thuộc tầng nào trong giao thức TCP/IP",
    "options": [
      {
        "key": "a",
        "text": "Tầng ứng dụng (Application)"
      },
      {
        "key": "b",
        "text": "Tầng giao vận (Transport)"
      },
      {
        "key": "c",
        "text": "Tầng mạng (Internet)"
      },
      {
        "key": "d",
        "text": "Tất cả các tầng"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-3",
    "stt": 3,
    "category": "TCP/IP Căn bản",
    "title": "Các giao thức nào sau đây thuộc tầng vật lý (Physical - Link)",
    "options": [
      {
        "key": "a",
        "text": "IP, ARP, TCP"
      },
      {
        "key": "b",
        "text": "IP, UDP, TCP"
      },
      {
        "key": "c",
        "text": "IP, TCP, USP, ARP"
      },
      {
        "key": "d",
        "text": "Ethernet, Wifi, PPP"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-4",
    "stt": 4,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP có độ dài bao nhiêu bit và được phân thành bao nhiêu lớp?",
    "options": [
      {
        "key": "a",
        "text": "32 bit, 4 lớp (A, B,C,D)"
      },
      {
        "key": "b",
        "text": "32 bit, 5 lớp (A, B, C, D, E)"
      },
      {
        "key": "c",
        "text": "48 bit, 4 lớp (A, B, C, D)"
      },
      {
        "key": "d",
        "text": "48 bit, 5 lớp (A, B, C, D, E)"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-5",
    "stt": 5,
    "category": "TCP/IP Căn bản",
    "title": "Trong các địa chỉ sau, chọn địa chỉ không nằm cùng đường mạng với các địa chỉ còn lại:",
    "options": [
      {
        "key": "a",
        "text": "203.29.100.100/255.255.255.240"
      },
      {
        "key": "b",
        "text": "203.29.100.110/255.255.255.240"
      },
      {
        "key": "c",
        "text": "203.29.103.113/255.255.255.240"
      },
      {
        "key": "d",
        "text": "203.29.100.98/255.255.255.240"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-6",
    "stt": 6,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ nào sau đây là địa chỉ broadcast của mạng lớp B là:",
    "options": [
      {
        "key": "a",
        "text": "149.255.255.255"
      },
      {
        "key": "b",
        "text": "149.6.255.255"
      },
      {
        "key": "c",
        "text": "149.6.7.255"
      },
      {
        "key": "d",
        "text": "Tất cả các đều sai"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-7",
    "stt": 7,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ nào sau đây thuộc lớp A",
    "options": [
      {
        "key": "a",
        "text": "172.29.14.10"
      },
      {
        "key": "b",
        "text": "10.1.1.1"
      },
      {
        "key": "c",
        "text": "140.8.8.8"
      },
      {
        "key": "d",
        "text": "203.5.6.7"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-8",
    "stt": 8,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP nào sau đây hợp lệ",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.2"
      },
      {
        "key": "b",
        "text": "255.255.255.254"
      },
      {
        "key": "c",
        "text": "321.1.2.3"
      },
      {
        "key": "d",
        "text": "Tất cả các câu trên"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-9",
    "stt": 9,
    "category": "TCP/IP Căn bản",
    "title": "Trong mạng máy tính dùng giao thức TCP/IP và đều dùng Subnet Mask là 255.255.255.0 thì cặp máy tính nào sau đây liên thông",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.3 và 192.168.100.1"
      },
      {
        "key": "b",
        "text": "192.168.15.1 và 192.168.15.254"
      },
      {
        "key": "c",
        "text": "192.168.100.15 và 192.186.100.16"
      },
      {
        "key": "d",
        "text": "172.25.11.1 và 172.26.11.2"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-10",
    "stt": 10,
    "category": "TCP/IP Căn bản",
    "title": "Trong mạng máy tính dùng giao thức TCP/IP và Subnet Mask là 255.255.255.224 hãy xác định địa chỉ broadcast của mạng nếu biết rằng một máy tính trong mạng có địa chỉ 192.168.1.1",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.31"
      },
      {
        "key": "b",
        "text": "192.168.1.255"
      },
      {
        "key": "c",
        "text": "192.168.1.15"
      },
      {
        "key": "d",
        "text": "192.168.1.96"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-11",
    "stt": 11,
    "category": "TCP/IP Căn bản",
    "title": "Cho địa chỉ IP 192.168.2.30/12, mặt nạ mạng là?",
    "options": [
      {
        "key": "a",
        "text": "255.240.0.0"
      },
      {
        "key": "b",
        "text": "255.255.0.0"
      },
      {
        "key": "c",
        "text": "255.255.255.0"
      },
      {
        "key": "d",
        "text": "255.255.240.0"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-12",
    "stt": 12,
    "category": "TCP/IP Căn bản",
    "title": "Cho địa chỉ IP 192.55.12.120/28, địa chỉ quảng bá là?",
    "options": [
      {
        "key": "a",
        "text": "192.55.255.255"
      },
      {
        "key": "b",
        "text": "192.255.255.255"
      },
      {
        "key": "c",
        "text": "192.55.12.255"
      },
      {
        "key": "d",
        "text": "192.55.12.127"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-13",
    "stt": 13,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP 128.122.11.1 thuộc lớp nào?",
    "options": [
      {
        "key": "a",
        "text": "Lớp B"
      },
      {
        "key": "b",
        "text": "Lớp C"
      },
      {
        "key": "c",
        "text": "Lớp D"
      },
      {
        "key": "d",
        "text": "Lớp A"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-14",
    "stt": 14,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP lớp C có bao nhiêu bit dành cho phần mạng?",
    "options": [
      {
        "key": "a",
        "text": "8"
      },
      {
        "key": "b",
        "text": "24"
      },
      {
        "key": "c",
        "text": "203.29.103.113/255.255.255.240"
      },
      {
        "key": "d",
        "text": "22"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-15",
    "stt": 15,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP nào sau đây không hợp lệ",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.2"
      },
      {
        "key": "b",
        "text": "521.123.1.2"
      },
      {
        "key": "c",
        "text": "255.255.255.254"
      },
      {
        "key": "d",
        "text": "10.20.30.40"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-16",
    "stt": 16,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ MAC có chiều dài bao nhiêu bit",
    "options": [
      {
        "key": "a",
        "text": "48"
      },
      {
        "key": "b",
        "text": "32"
      },
      {
        "key": "c",
        "text": "64"
      },
      {
        "key": "d",
        "text": "128"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-17",
    "stt": 17,
    "category": "TCP/IP Căn bản",
    "title": "Cho địa chỉ IP 192.168.1.32/27. Dãy địa chỉ IP có thể gán cho máy tính là?",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.32 – 192.168.1.64"
      },
      {
        "key": "b",
        "text": "192.168.1.33 – 192.168.1.62"
      },
      {
        "key": "c",
        "text": "192.168.1.32 – 192.168.1.62"
      },
      {
        "key": "d",
        "text": "192.168.1.33 – 192.168.1.63"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-18",
    "stt": 18,
    "category": "TCP/IP Căn bản",
    "title": "DHCP dùng để?",
    "options": [
      {
        "key": "a",
        "text": "Truy cập web."
      },
      {
        "key": "b",
        "text": "Phân giải tên miền."
      },
      {
        "key": "c",
        "text": "Cấp phát IP động."
      },
      {
        "key": "d",
        "text": "Gửi thư điện tử."
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-19",
    "stt": 19,
    "category": "TCP/IP Căn bản",
    "title": "Công ty ABC có hai mạng LAN. LAN 1 sử dụng địa chỉ 172.16.0.0/16. LAN 2 sử dụng địa chỉ 192.168.1.0/24. Công ty muốn kết nối 2 mạng LAN đó với nhau thì sử dụng thiết bị nào?",
    "options": [
      {
        "key": "a",
        "text": "Firewall."
      },
      {
        "key": "b",
        "text": "Hub/Repeater."
      },
      {
        "key": "c",
        "text": "Router."
      },
      {
        "key": "d",
        "text": "Bridge/Switch."
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-20",
    "stt": 20,
    "category": "TCP/IP Căn bản",
    "title": "Địa chỉ IP nào sau đây là địa chỉ quảng bá cho một mạng bất kỳ",
    "options": [
      {
        "key": "a",
        "text": "255.255.255.255"
      },
      {
        "key": "b",
        "text": "172.16.1.255"
      },
      {
        "key": "c",
        "text": "1.1.1.1"
      },
      {
        "key": "d",
        "text": "30.20.30.255"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-21",
    "stt": 21,
    "category": "TCP/IP Căn bản",
    "title": "Chuỗi số “00-08-ac-41-5d-9f” có thể là:",
    "options": [
      {
        "key": "a",
        "text": "Địa chỉ IP"
      },
      {
        "key": "b",
        "text": "Địa chỉ port"
      },
      {
        "key": "c",
        "text": "Địa chỉ MAC"
      },
      {
        "key": "d",
        "text": "Tất cả đều sai"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-22",
    "stt": 22,
    "category": "TCP/IP Căn bản",
    "title": "Thiết bị nào hoạt động ở tầng Physical:",
    "options": [
      {
        "key": "a",
        "text": "Switch"
      },
      {
        "key": "b",
        "text": "Card Mạng"
      },
      {
        "key": "c",
        "text": "Router"
      },
      {
        "key": "d",
        "text": "Tất cả đều đúng"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-23",
    "stt": 23,
    "category": "TCP/IP Căn bản",
    "title": "Giao thức IP hoạt động tại lớp nào trong mô hình TCP/IP?",
    "options": [
      {
        "key": "a",
        "text": "Lớp Truy nhập mạng"
      },
      {
        "key": "b",
        "text": "Lớp Phiên"
      },
      {
        "key": "c",
        "text": "Lớp liên mạng"
      },
      {
        "key": "d",
        "text": "Lớp truyền tải"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-24",
    "stt": 24,
    "category": "TCP/IP Căn bản",
    "title": "Câu 1: Trong mô hình TCP/IP, giao thức SNMP (Simple Network Management Protocol) hoạt động tại tầng nào?",
    "options": [
      {
        "key": "a",
        "text": "Tầng Truy cập mạng (Network Access)"
      },
      {
        "key": "b",
        "text": "Tầng Internet"
      },
      {
        "key": "c",
        "text": "Tầng Giao vận (Transport)"
      },
      {
        "key": "d",
        "text": "Tầng Ứng dụng (Application)"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-25",
    "stt": 25,
    "category": "TCP/IP Căn bản",
    "title": "Câu 2: Giao thức TCP (Transmission Control Protocol) có đặc điểm nào dưới đây?",
    "options": [
      {
        "key": "a",
        "text": "Là giao thức không hướng kết nối (connectionless)"
      },
      {
        "key": "b",
        "text": "Cung cấp khả năng truyền tin tin cậy và kiểm soát luồng"
      },
      {
        "key": "c",
        "text": "Tốc độ truyền nhanh hơn UDP do không cần xác nhận"
      },
      {
        "key": "d",
        "text": "Sử dụng địa chỉ MAC để xác định đích đến"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-26",
    "stt": 26,
    "category": "TCP/IP Căn bản",
    "title": "Một thiết bị có địa chỉ IP là 192.168.1.5 và Subnet Mask là 255.255.255.0. Địa chỉ mạng (Network Address) của thiết bị này là gì?",
    "options": [
      {
        "key": "a",
        "text": "192.168.1.0"
      },
      {
        "key": "b",
        "text": "192.168.1.255"
      },
      {
        "key": "c",
        "text": "192.168.0.0"
      },
      {
        "key": "d",
        "text": "0.0.0.0"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-27",
    "stt": 27,
    "category": "TCP/IP Căn bản",
    "title": "Câu 4: Chức năng chính của giao thức ARP (Address Resolution Protocol) là gì?",
    "options": [
      {
        "key": "a",
        "text": "Chuyển đổi tên miền thành địa chỉ IP"
      },
      {
        "key": "b",
        "text": "Tìm địa chỉ MAC khi đã biết địa chỉ IP"
      },
      {
        "key": "c",
        "text": "Tự động cấp phát địa chỉ IP cho máy trạm"
      },
      {
        "key": "d",
        "text": "Định tuyến gói tin giữa các mạng khác nhau"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-28",
    "stt": 28,
    "category": "TCP/IP Căn bản",
    "title": "Giao thức định tuyến nào sau đây được phân loại là giao thức trạng thái liên kết (Link-State Routing Protocol)?",
    "options": [
      {
        "key": "a",
        "text": "OSPF (Open Shortest Path First)"
      },
      {
        "key": "b",
        "text": "IGRP (Interior Gateway Routing Protocol)"
      },
      {
        "key": "c",
        "text": "RIP (Routing Information Protocol)"
      },
      {
        "key": "d",
        "text": "BGP (Border Gateway Protocol)"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-29",
    "stt": 29,
    "category": "TCP/IP Căn bản",
    "title": "Câu 6: Giao thức UDP thường được ưu tiên sử dụng cho loại ứng dụng nào?",
    "options": [
      {
        "key": "a",
        "text": "Gửi thư điện tử (Email)"
      },
      {
        "key": "b",
        "text": "Truyền tệp tin (FTP)"
      },
      {
        "key": "c",
        "text": "Dịch vụ truyền phát trực tuyến (Streaming video/Voice)"
      },
      {
        "key": "d",
        "text": "Truy cập web (HTTP/HTTPS)"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-30",
    "stt": 30,
    "category": "TCP/IP Căn bản",
    "title": "Trong kiến thức về TCP/IP, thiết bị nào thực hiện chức năng định tuyến chính để chuyển tiếp gói tin giữa các mạng khác nhau?",
    "options": [
      {
        "key": "a",
        "text": "Router"
      },
      {
        "key": "b",
        "text": "Hub"
      },
      {
        "key": "c",
        "text": "Switch Layer 2"
      },
      {
        "key": "d",
        "text": "Repeater"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-31",
    "stt": 31,
    "category": "Khai thác đầu cuối CWP",
    "title": "Thanh thông tin (Information Bar) hiển thị các thông tin nào sau đây?",
    "options": [
      {
        "key": "a",
        "text": "Tên Role hoạt động, Trạng thái hệ thống, Thời gian hiện tại"
      },
      {
        "key": "b",
        "text": "Danh bạ điện thoại"
      },
      {
        "key": "c",
        "text": "Tần số đang thiết lập"
      },
      {
        "key": "d",
        "text": "Cấu hình Audio"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-32",
    "stt": 32,
    "category": "Khai thác đầu cuối CWP",
    "title": "Biểu tượng \"Dấu check trên nền xanh lá cây\" ở góc trên bên phải màn hình có ý nghĩa gì?",
    "options": [
      {
        "key": "a",
        "text": "Đang có lỗi LAN"
      },
      {
        "key": "b",
        "text": "Cấu hình vừa bị thay đổi"
      },
      {
        "key": "c",
        "text": "Trạng thái bình thường, hệ thống hoạt động tốt"
      },
      {
        "key": "d",
        "text": "Mất kết nối cơ sở dữ liệu"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-33",
    "stt": 33,
    "category": "Khai thác đầu cuối CWP",
    "title": "Biểu tượng \"Thanh gạch ngang trên nền đỏ\" báo hiệu lỗi gì?",
    "options": [
      {
        "key": "a",
        "text": "Lỗi cơ sở dữ liệu"
      },
      {
        "key": "b",
        "text": "Bị ngắt kết nối mạng LAN hoàn toàn (tất cả các giao diện mạng đều down)"
      },
      {
        "key": "c",
        "text": "Tải cấu hình thất bại"
      },
      {
        "key": "d",
        "text": "Chưa cắm tai nghe"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-34",
    "stt": 34,
    "category": "Khai thác đầu cuối CWP",
    "title": "Biểu tượng \"Dấu chấm than trên nền vàng\" cảnh báo điều gì?",
    "options": [
      {
        "key": "a",
        "text": "Lỗi mạng LAN một phần"
      },
      {
        "key": "b",
        "text": "Mất kết nối đến cơ sở dữ liệu VCMS"
      },
      {
        "key": "c",
        "text": "Cần phải khởi động lại máy"
      },
      {
        "key": "d",
        "text": "Yêu cầu tải lại (Reload) cấu hình"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-35",
    "stt": 35,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi biểu tượng \"Mũi tên xoay tròn trên nền xanh dương\" xuất hiện, nhân viên kỹ thuật cần làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Khởi động lại thiết bị phần cứng"
      },
      {
        "key": "b",
        "text": "Lau chùi màn hình"
      },
      {
        "key": "c",
        "text": "Cấu hình đã thay đổi và yêu cầu thực hiện tải lại (Reload)"
      },
      {
        "key": "d",
        "text": "Tắt âm thanh cảnh báo"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-36",
    "stt": 36,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng chính của nút \"END CALL\" là gì?",
    "options": [
      {
        "key": "a",
        "text": "Tắt hệ thống CWP"
      },
      {
        "key": "b",
        "text": "Từ chối đăng nhập"
      },
      {
        "key": "c",
        "text": "Kết thúc cuộc gọi điện thoại hiện tại"
      },
      {
        "key": "d",
        "text": "Ngắt toàn bộ tần số vô tuyến"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-37",
    "stt": 37,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"END CALL\" sẽ có trạng thái như thế nào khi không có cuộc gọi nào đang kết nối?",
    "options": [
      {
        "key": "a",
        "text": "Sáng màu đỏ"
      },
      {
        "key": "b",
        "text": "Vô hiệu hóa (màu xám nhạt)"
      },
      {
        "key": "c",
        "text": "Nhấp nháy màu xanh"
      },
      {
        "key": "d",
        "text": "Ẩn khỏi màn hình"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-38",
    "stt": 38,
    "category": "Khai thác đầu cuối CWP",
    "title": "Thanh chức năng bên trái (Left Function Bar) chủ yếu chứa các phím điều khiển cho hệ thống nào?",
    "options": [
      {
        "key": "a",
        "text": "Điện thoại"
      },
      {
        "key": "b",
        "text": "Vô tuyến (Radio)"
      },
      {
        "key": "c",
        "text": "Cơ sở dữ liệu"
      },
      {
        "key": "d",
        "text": "Cấu hình âm thanh"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-39",
    "stt": 39,
    "category": "Khai thác đầu cuối CWP",
    "title": "Thanh chức năng bên phải (Right Function Bar) chủ yếu chứa các phím điều khiển cho hệ thống nào?",
    "options": [
      {
        "key": "a",
        "text": "Vô tuyến"
      },
      {
        "key": "b",
        "text": "Quản trị hệ thống"
      },
      {
        "key": "c",
        "text": "Mạng LAN"
      },
      {
        "key": "d",
        "text": "Điện thoại (Telephony)"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-40",
    "stt": 40,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"DIR\" trên thanh công cụ bên phải có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Gọi trực tiếp một số"
      },
      {
        "key": "b",
        "text": "Mở danh bạ điện thoại"
      },
      {
        "key": "c",
        "text": "Chuyển cuộc gọi"
      },
      {
        "key": "d",
        "text": "Ghi âm cuộc gọi"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-41",
    "stt": 41,
    "category": "Khai thác đầu cuối CWP",
    "title": "Phím \"EMERG\" ở thanh công cụ trên cùng được sử dụng với mục đích gì?",
    "options": [
      {
        "key": "a",
        "text": "Kích hoạt cuộc gọi đi với mức ưu tiên cao nhất (Emergency)"
      },
      {
        "key": "b",
        "text": "Tắt nóng hệ thống"
      },
      {
        "key": "c",
        "text": "Phát báo động toàn trung tâm"
      },
      {
        "key": "d",
        "text": "Khóa các CWP khác"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-42",
    "stt": 42,
    "category": "Khai thác đầu cuối CWP",
    "title": "Có thể tăng giảm âm lượng của Loa và tai nghe trên VCS 4G bằng cách nào?",
    "options": [
      {
        "key": "a",
        "text": "Vặn núm chỉnh âm lượng trên Audio box"
      },
      {
        "key": "b",
        "text": "Chỉnh trong phần Audio trên CWP"
      },
      {
        "key": "c",
        "text": "Cả a&b"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-43",
    "stt": 43,
    "category": "Khai thác đầu cuối CWP",
    "title": "Cách chuyển đổi máy Main/Stanby nào sau đây là đúng?",
    "options": [
      {
        "key": "a",
        "text": "Nhấn vào ô “Tx SEL” (hoặc “Rx”) cần chuyển."
      },
      {
        "key": "b",
        "text": "Nhấn nút M/S trên thanh công cụ rồi nhấn vào ô “Tx SEL” (hoặc “Rx”) cần chuyển."
      },
      {
        "key": "c",
        "text": "Cả a&b"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-44",
    "stt": 44,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng SELCAL trên bàn CWP dùng để?",
    "options": [
      {
        "key": "a",
        "text": "Được dùng để gửi các mă (codes) nhằm báo cho phi công rằng KSVKL cần liên lạc khi radio trên máy bay để chế độ vặn nhỏ âm lượng."
      },
      {
        "key": "b",
        "text": "Cho phép kết nối thoại giữa 1 tần số vô tuyến được chọn với 1 điện thoại trên mặt đất khác."
      },
      {
        "key": "c",
        "text": "Là chức năng phát lại tự động một tín hiệu thu được tới các tần số vô tuyến khác."
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-45",
    "stt": 45,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng Frequency Cross Coupling (XC) trên bàn CWP là chức năng?",
    "options": [
      {
        "key": "a",
        "text": "Phát lại tự động một tín hiệu thu được tới các tần số vô tuyến khác."
      },
      {
        "key": "b",
        "text": "Cho phép KSVKL tham gia vào một cuộc liên lạc giữa CWP, điện thoại trên mặt đất và phi công"
      },
      {
        "key": "c",
        "text": "Cho phép kết nối thoại giữa 1 tần số vô tuyến được chọn với 1 điện thoại trên mặt đất khác."
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-46",
    "stt": 46,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trên CWP, khi KSVKL chọn “Tx SEL” thì “Rx SEL” sẽ như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Tự động được chọn"
      },
      {
        "key": "b",
        "text": "Không được chọn"
      },
      {
        "key": "c",
        "text": "Không được chọn nhưng khi có thu thì tự động được chọn"
      },
      {
        "key": "d",
        "text": "Tùy vào cấu hình trên phần mềm giám sát"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-47",
    "stt": 47,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng REC trên thanh công cụ dùng để?",
    "options": [
      {
        "key": "a",
        "text": "Ghi âm cuộc thoại A/G gần nhất"
      },
      {
        "key": "b",
        "text": "Ghi âm cuộc thoại G/G gần nhất"
      },
      {
        "key": "c",
        "text": "Ghi âm cuộc thoại A/G, G/G gần nhất"
      },
      {
        "key": "d",
        "text": "Nghe lại ghi âm các cuộc thoại A/G, G/G gần nhất"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-48",
    "stt": 48,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng SAY AGAIN trên bàn CWP dùng để?",
    "options": [
      {
        "key": "a",
        "text": "Phát lại tất cả các cuộc gọi trong ngày"
      },
      {
        "key": "b",
        "text": "Yêu cầu đài phát bên kia nói lại"
      },
      {
        "key": "c",
        "text": "Phát lại duy nhất đoạn hội thoại vô tuyến/điện thoại diễn ra cuối cùng (gần nhất)"
      },
      {
        "key": "d",
        "text": "Ghi âm thêm 5 phút"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-49",
    "stt": 49,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng RLD (reload) trên bàn CWP dùng để?",
    "options": [
      {
        "key": "a",
        "text": "Tắt màn hình CWP trong thời gian ngắn để vệ sinh"
      },
      {
        "key": "b",
        "text": "Cập nhật cấu hình mới cho CWP"
      },
      {
        "key": "c",
        "text": "Khởi động lại màn hình CWP"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-50",
    "stt": 50,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi nhấn nút CLEAN để vệ sinh bề mặt cảm ứng thì phát biểu nào sau đây là đúng nhất",
    "options": [
      {
        "key": "a",
        "text": "Bàn CWP không hoạt động"
      },
      {
        "key": "b",
        "text": "Bàn CWP vẫn hoạt động bình thường"
      },
      {
        "key": "c",
        "text": "Bàn CWP vẫn hoạt động bình thường nhưng cảm ứng bị vô hiệu hóa trong 15s để vệ sinh"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-51",
    "stt": 51,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi CWP mất kết nối với server VCMS thì",
    "options": [
      {
        "key": "a",
        "text": "CWP vẫn hoạt động bình thường nhưng không thể cập nhật cấu hình mới."
      },
      {
        "key": "b",
        "text": "CWP chỉ nhận được cuộc gọi mà không thể trả lời"
      },
      {
        "key": "c",
        "text": "CWP bị treo"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-52",
    "stt": 52,
    "category": "Khai thác đầu cuối CWP",
    "title": "Có thể xem lại lịch sử các cuộc liên lạc thoại của bàn CWP bằng cách nào?",
    "options": [
      {
        "key": "a",
        "text": "Trên máy tính giám sát"
      },
      {
        "key": "b",
        "text": "Trên bàn CWP, mục History"
      },
      {
        "key": "c",
        "text": "Cả a&b"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-53",
    "stt": 53,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trên VCS 4G có các cách PTT nào sau đây?",
    "options": [
      {
        "key": "a",
        "text": "Footswitch"
      },
      {
        "key": "b",
        "text": "Handset/Headset"
      },
      {
        "key": "c",
        "text": "PTT mềm trên CWP"
      },
      {
        "key": "d",
        "text": "Tất cả đáp án trên"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-54",
    "stt": 54,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi “Rx SEL” nháy báo nhận được âm tần nhưng không nghe được âm tần thì có những khả năng nào xảy ra?",
    "options": [
      {
        "key": "a",
        "text": "Âm tần không được định tuyến (Route) đến loa/tai nghe được cấu hình"
      },
      {
        "key": "b",
        "text": "Loa/tai nghe đang bị MUTE"
      },
      {
        "key": "c",
        "text": "Loa/tai nghe bị lỗi"
      },
      {
        "key": "d",
        "text": "Tất cả các phương án trên"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-55",
    "stt": 55,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút HALT có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Khởi động lại CWP"
      },
      {
        "key": "b",
        "text": "Tắt (shut down) CWP"
      },
      {
        "key": "c",
        "text": "Tắt CWP trong thời gian ngắn để vệ sinh"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-56",
    "stt": 56,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tính năng \"SPLIT\" trong menu TOOLS bị vô hiệu hóa tự động khi nào?",
    "options": [
      {
        "key": "a",
        "text": "Khi mất kết nối mạng"
      },
      {
        "key": "b",
        "text": "Khi không có tai nghe/micro nào được kết nối với CWP"
      },
      {
        "key": "c",
        "text": "Khi đang có cuộc gọi khẩn cấp"
      },
      {
        "key": "d",
        "text": "Khi có báo động cháy"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-57",
    "stt": 57,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"ALW MON\" trong menu TOOLS cho phép điều gì?",
    "options": [
      {
        "key": "a",
        "text": "Cho phép giám sát vị trí trực tiếp (Direct position monitoring)"
      },
      {
        "key": "b",
        "text": "Tắt toàn bộ âm thanh"
      },
      {
        "key": "c",
        "text": "Cho phép CWP khác giám sát vị trí của CWP này thông qua cuộc gọi IA"
      },
      {
        "key": "d",
        "text": "Cho phép ghi âm cục bộ"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-58",
    "stt": 58,
    "category": "Khai thác đầu cuối CWP",
    "title": "Để giám sát vị trí trực tiếp (Direct position monitoring) của một CWP khác, cần nhấn nút nào trong menu TOOLS?",
    "options": [
      {
        "key": "a",
        "text": "POS MON"
      },
      {
        "key": "b",
        "text": "ALW MON"
      },
      {
        "key": "c",
        "text": "SAY AGAIN"
      },
      {
        "key": "d",
        "text": "RLD"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-59",
    "stt": 59,
    "category": "Khai thác đầu cuối CWP",
    "title": "Điều gì sẽ xảy ra đối với các cuộc gọi đang diễn ra (ongoing calls) khi kiểm soát viên nhấn nút \"RLD\" (Reload)?",
    "options": [
      {
        "key": "a",
        "text": "Các cuộc gọi được giữ nguyên không ảnh hưởng"
      },
      {
        "key": "b",
        "text": "Các cuộc gọi sẽ bị chuyển hướng sang CWP khác"
      },
      {
        "key": "c",
        "text": "Tất cả các cuộc gọi đang diễn ra sẽ bị ngắt và khởi tạo lại (re-initiated) d. Cuộc gọi sẽ bị ghi âm lại"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-60",
    "stt": 60,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi thông báo \"There are unmonitored frequencies\" xuất hiện, kiểm soát viên dùng nút nào để xem danh sách này?",
    "options": [
      {
        "key": "a",
        "text": "RLD"
      },
      {
        "key": "b",
        "text": "LOG"
      },
      {
        "key": "c",
        "text": "UNMON FREQ"
      },
      {
        "key": "d",
        "text": "INFO"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-61",
    "stt": 61,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"LOG\" trong menu TOOLS hiển thị danh sách gì?",
    "options": [
      {
        "key": "a",
        "text": "Nhật ký truy cập mạng"
      },
      {
        "key": "b",
        "text": "Danh sách các tin nhắn, cảnh báo và lỗi hệ thống đã hiển thị trên thanh thông tin"
      },
      {
        "key": "c",
        "text": "Danh sách các cuộc gọi điện thoại"
      },
      {
        "key": "d",
        "text": "Tên các kiểm soát viên đã đăng nhập"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-62",
    "stt": 62,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong cửa sổ LOG, nút \"CLEAR\" có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Đóng cửa sổ LOG"
      },
      {
        "key": "b",
        "text": "Xóa cuộc gọi cuối cùng"
      },
      {
        "key": "c",
        "text": "Xóa toàn bộ các thông báo khỏi danh sách LOG"
      },
      {
        "key": "d",
        "text": "Xóa bộ nhớ đệm của CWP"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-63",
    "stt": 63,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi nhấn \"LOGOUT\" và chọn \"REBOOT\", hành động nào sẽ xảy ra?",
    "options": [
      {
        "key": "a",
        "text": "Đăng xuất khỏi hệ thống VCMS"
      },
      {
        "key": "b",
        "text": "CWP sẽ khởi động lại phần mềm, ngắt toàn bộ liên lạc thoại"
      },
      {
        "key": "c",
        "text": "Tắt nguồn phần cứng"
      },
      {
        "key": "d",
        "text": "Khôi phục cài đặt gốc"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-64",
    "stt": 64,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trình đơn AUDIO được thiết kế để điều khiển những gì?",
    "options": [
      {
        "key": "a",
        "text": "Chỉ âm lượng loa ngoài"
      },
      {
        "key": "b",
        "text": "Chỉ âm lượng tai nghe"
      },
      {
        "key": "c",
        "text": "Định tuyến âm thanh và điều chỉnh âm lượng cho tất cả các thiết bị đầu ra (tai nghe, loa) và từng tài nguyên"
      },
      {
        "key": "d",
        "text": "Tốc độ truyền dữ liệu mạng"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-65",
    "stt": 65,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong cửa sổ AUDIO, nếu một tai nghe không được kết nối vật lý với CWP, giao diện sẽ hiển thị như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Có màu đỏ"
      },
      {
        "key": "b",
        "text": "Nhấp nháy liên tục"
      },
      {
        "key": "c",
        "text": "Bị làm mờ (grayed out)"
      },
      {
        "key": "d",
        "text": "Hiện dấu chấm hỏi"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-66",
    "stt": 66,
    "category": "Khai thác đầu cuối CWP",
    "title": "Biểu tượng micro trong cửa sổ AUDIO (dưới cột âm lượng) dùng để điều chỉnh thông số gì?",
    "options": [
      {
        "key": "a",
        "text": "Độ nhạy của micro (Microphone sensitivity)"
      },
      {
        "key": "b",
        "text": "Bật/tắt micro"
      },
      {
        "key": "c",
        "text": "Thu âm cuộc gọi"
      },
      {
        "key": "d",
        "text": "Chỉnh âm lượng loa"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-67",
    "stt": 67,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong tab \"MORE\" của cửa sổ AUDIO, cột \"CLICK\" dùng để điều chỉnh âm lượng của âm thanh nào?",
    "options": [
      {
        "key": "a",
        "text": "Tiếng click chuột máy tính"
      },
      {
        "key": "b",
        "text": "Âm thanh phản hồi khi chạm vào các nút trên màn hình cảm ứng GUI"
      },
      {
        "key": "c",
        "text": "Tiếng sập rơ-le"
      },
      {
        "key": "d",
        "text": "Âm thanh báo lỗi"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-68",
    "stt": 68,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"BUZZER ON/OFF/ONCE\" ảnh hưởng đến loại cảnh báo nào?",
    "options": [
      {
        "key": "a",
        "text": "Cảnh báo lỗi hệ thống"
      },
      {
        "key": "b",
        "text": "Âm thanh chuông báo cuộc gọi điện thoại đến"
      },
      {
        "key": "c",
        "text": "Cảnh báo thời tiết"
      },
      {
        "key": "d",
        "text": "Báo động vô tuyến"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-69",
    "stt": 69,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nếu tính năng \"PTT SUMM\" không được kích hoạt, điều gì sẽ xảy ra khi hai người cùng muốn bấm PTT trên một tần số?",
    "options": [
      {
        "key": "a",
        "text": "Cả hai người đều phát được"
      },
      {
        "key": "b",
        "text": "Tần số bị khóa tạm thời"
      },
      {
        "key": "c",
        "text": "Người bấm PTT đầu tiên sẽ khóa kênh, người thứ hai không thể phát cho đến khi người thứ nhất nhả nút"
      },
      {
        "key": "d",
        "text": "Gây ra cảnh báo lỗi mạng"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-70",
    "stt": 70,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng \"PHONE TO SPK\" dùng để làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Định tuyến giọng nói của cuộc gọi điện thoại (ground-ground) ra loa ngoài của CWP"
      },
      {
        "key": "b",
        "text": "Chuyển cuộc gọi đến loa của CWP khác"
      },
      {
        "key": "c",
        "text": "Phát nhạc chuông ra loa ngoài"
      },
      {
        "key": "d",
        "text": "Thu âm từ loa ngoài"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-71",
    "stt": 71,
    "category": "Khai thác đầu cuối CWP",
    "title": "\"PHONE PTT\" là tính năng cho phép điều gì?",
    "options": [
      {
        "key": "a",
        "text": "Bắt buộc người dùng phải nhấn phím PTT mới có thể truyền giọng nói trong cuộc gọi điện thoại"
      },
      {
        "key": "b",
        "text": "Gọi điện thoại rảnh tay"
      },
      {
        "key": "c",
        "text": "Dùng điện thoại để phát vô tuyến"
      },
      {
        "key": "d",
        "text": "Chặn các cuộc gọi không có PTT"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-72",
    "stt": 72,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi tính năng \"AUTO ROUTING\" được kích hoạt, điều gì sẽ xảy ra?",
    "options": [
      {
        "key": "a",
        "text": "Tự động chuyển cuộc gọi khi bận"
      },
      {
        "key": "b",
        "text": "Tự động định tuyến âm thanh vô tuyến ra loa ngoài đối với các tần số không được cài đặt định tuyến cá nhân"
      },
      {
        "key": "c",
        "text": "Tự động chuyển tần số khi bị nhiễu"
      },
      {
        "key": "d",
        "text": "Tự động gọi lại số bị nhỡ"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-73",
    "stt": 73,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"MUTE MIC\" có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Tắt tiếng loa ngoài"
      },
      {
        "key": "b",
        "text": "Tắt tiếng tai nghe"
      },
      {
        "key": "c",
        "text": "Tắt tiếng micro của kiểm soát viên mà không có thêm chỉ báo hình ảnh nào khác"
      },
      {
        "key": "d",
        "text": "Tắt tiếng chuông báo động"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-74",
    "stt": 74,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"ROLES\" ở thanh trên cùng hiển thị menu cho phép làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Chuyển đổi giữa các tài khoản người dùng"
      },
      {
        "key": "b",
        "text": "Xem danh sách các Role (phân quyền) có sẵn, Role chưa được gán, và yêu cầu/giải phóng Role"
      },
      {
        "key": "c",
        "text": "Đổi tên CWP"
      },
      {
        "key": "d",
        "text": "Thiết lập quyền truy cập mạng"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-75",
    "stt": 75,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"TRAIN\" kích hoạt chế độ nào?",
    "options": [
      {
        "key": "a",
        "text": "Chế độ Trainer/Trainee (Người hướng dẫn / Học viên)"
      },
      {
        "key": "b",
        "text": "Chế độ học tập mô phỏng mạng"
      },
      {
        "key": "c",
        "text": "Tự động huấn luyện giọng nói"
      },
      {
        "key": "d",
        "text": "Chế độ lái tự động"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-76",
    "stt": 76,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"MON\" (Monitoring) cho phép chọn các chế độ giám sát nào?",
    "options": [
      {
        "key": "a",
        "text": "MON A/G, MON G/G, A/G G/G"
      },
      {
        "key": "b",
        "text": "MON TX, MON RX"
      },
      {
        "key": "c",
        "text": "MON LAN, MON WAN"
      },
      {
        "key": "d",
        "text": "MON AUDIO, MON VIDEO"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-77",
    "stt": 77,
    "category": "Khai thác đầu cuối CWP",
    "title": "Menu REC hiển thị danh sách các cuộc hội thoại nào?",
    "options": [
      {
        "key": "a",
        "text": "Chỉ các cuộc gọi vô tuyến thu (RX)"
      },
      {
        "key": "b",
        "text": "Chỉ các cuộc gọi vô tuyến phát (TX)"
      },
      {
        "key": "c",
        "text": "Chỉ các cuộc gọi điện thoại"
      },
      {
        "key": "d",
        "text": "Tất cả các cuộc gọi vô tuyến (RX, TX) và điện thoại (Ground-ground) diễn ra gần đây"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-78",
    "stt": 78,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tính năng \"HISTORY\" trên thanh công cụ bên phải cung cấp thông tin gì?",
    "options": [
      {
        "key": "a",
        "text": "Lịch sử thay đổi cấu hình hệ thống"
      },
      {
        "key": "b",
        "text": "Danh sách tất cả các cuộc gọi điện thoại đến (IN), đi (OUT), và nhỡ (MISSED) trên CWP"
      },
      {
        "key": "c",
        "text": "Lịch sử bảo trì phần cứng"
      },
      {
        "key": "d",
        "text": "Lịch sử các lỗi mạng"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-79",
    "stt": 79,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"DIAL\" ở thanh công cụ bên phải mở ra công cụ gì?",
    "options": [
      {
        "key": "a",
        "text": "Bàn phím số để bấm số điện thoại trực tiếp (Dial pad)"
      },
      {
        "key": "b",
        "text": "La bàn định hướng"
      },
      {
        "key": "c",
        "text": "Cài đặt đồng hồ"
      },
      {
        "key": "d",
        "text": "Bảng điều khiển tần số"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-80",
    "stt": 80,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"TRANS\" dùng để làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Dịch ngôn ngữ tự động"
      },
      {
        "key": "b",
        "text": "Chuyển đổi giữa chế độ Vô tuyến và Điện thoại"
      },
      {
        "key": "c",
        "text": "Chuyển cuộc gọi điện thoại đang diễn ra (Call Transfer) sang một đích đến khác"
      },
      {
        "key": "d",
        "text": "Truyền dữ liệu sang CWP khác"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-81",
    "stt": 81,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"CONF\" cho phép thực hiện tính năng nào?",
    "options": [
      {
        "key": "a",
        "text": "Cấu hình hệ thống"
      },
      {
        "key": "b",
        "text": "Khởi tạo và quản lý cuộc gọi hội nghị (Conference)"
      },
      {
        "key": "c",
        "text": "Xác nhận cảnh báo"
      },
      {
        "key": "d",
        "text": "Gửi tin nhắn bảo mật"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-82",
    "stt": 82,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"SELCAL\" yêu cầu thao tác nhấn như thế nào để hiển thị cửa sổ nhập mã?",
    "options": [
      {
        "key": "a",
        "text": "Nhấn đúp (Double click)"
      },
      {
        "key": "b",
        "text": "Nhấn ngắn (Short press)"
      },
      {
        "key": "c",
        "text": "Nhấn giữ lâu (Long press)"
      },
      {
        "key": "d",
        "text": "Vuốt sang phải"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-83",
    "stt": 83,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"M/S\" có tác dụng gì?",
    "options": [
      {
        "key": "a",
        "text": "Tắt/mở loa ngoài"
      },
      {
        "key": "b",
        "text": "Chuyển đổi thủ công giữa kênh Vô tuyến Chính (Main) và Dự phòng (Standby)"
      },
      {
        "key": "c",
        "text": "Lưu cấu hình hiện tại"
      },
      {
        "key": "d",
        "text": "Chuyển đổi giữa chế độ Thu và Phát"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-84",
    "stt": 84,
    "category": "Khai thác đầu cuối CWP",
    "title": "Ở chế độ \"Trainer / Trainee Mode\", quyền hạn của người hướng dẫn (Instructor) đối với nút PTT là gì?",
    "options": [
      {
        "key": "a",
        "text": "Không thể sử dụng PTT"
      },
      {
        "key": "b",
        "text": "Phải xin phép học viên trước khi bấm"
      },
      {
        "key": "c",
        "text": "PTT của người hướng dẫn sẽ ưu tiên và đè lên PTT của học viên"
      },
      {
        "key": "d",
        "text": "PTT chỉ kích hoạt được khi học viên cũng bấm"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-85",
    "stt": 85,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong chế độ \"Split Operational Mode\" với MỘT hộp âm thanh tai nghe duy nhất, tín hiệu được chia như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Tai nghe trái dùng cho bộ đàm (Radio), tai nghe phải dùng cho điện thoại (Telephony)"
      },
      {
        "key": "b",
        "text": "Loa ngoài cho bộ đàm, tai nghe cho điện thoại"
      },
      {
        "key": "c",
        "text": "Tai nghe trái cho gọi nội bộ, tai nghe phải gọi ra ngoài"
      },
      {
        "key": "d",
        "text": "Tai nghe trái dùng cho phát, tai nghe phải dùng cho nhận"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-86",
    "stt": 86,
    "category": "Khai thác đầu cuối CWP",
    "title": "\"Position Monitoring\" là tính năng cho phép kiểm soát viên làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Xem vị trí máy bay trên radar"
      },
      {
        "key": "b",
        "text": "Nghe/giám sát bất kỳ cuộc gọi nào đang hoạt động tại một CWP khác"
      },
      {
        "key": "c",
        "text": "Kiểm tra tín hiệu GPS"
      },
      {
        "key": "d",
        "text": "Theo dõi trạng thái nguồn điện"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-87",
    "stt": 87,
    "category": "Khai thác đầu cuối CWP",
    "title": "Để CWP A có thể giám sát CWP B bằng tính năng \"Directed Position Monitoring\", CWP B phải làm gì trước?",
    "options": [
      {
        "key": "a",
        "text": "Đăng xuất khỏi hệ thống"
      },
      {
        "key": "b",
        "text": "Nhấc máy điện thoại"
      },
      {
        "key": "c",
        "text": "Kích hoạt chức năng \"POS MON\" trên màn hình của mình"
      },
      {
        "key": "d",
        "text": "Nhấn nút PTT 3 lần"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-88",
    "stt": 88,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tính năng \"Ambient recording\" dùng để làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Ghi lại thao tác trên màn hình cảm ứng"
      },
      {
        "key": "b",
        "text": "Ghi lại tiếng ồn/âm thanh nền trong phòng hoặc tại bàn làm việc của kiểm soát viên"
      },
      {
        "key": "c",
        "text": "Ghi lại các cảnh báo lỗi của hệ thống"
      },
      {
        "key": "d",
        "text": "Ghi lại tiếng động cơ máy bay"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-89",
    "stt": 89,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chức năng \"Unattended CWP\" bảo vệ hệ thống như thế nào khi phát hiện không có tai nghe nào được kết nối?",
    "options": [
      {
        "key": "a",
        "text": "Khóa màn hình CWP"
      },
      {
        "key": "b",
        "text": "Chuyển toàn bộ tần số sang CWP khác"
      },
      {
        "key": "c",
        "text": "Tự động định tuyến tất cả âm thanh vô tuyến ra loa ngoài để không bị mất thông tin"
      },
      {
        "key": "d",
        "text": "Tắt nguồn điện"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-90",
    "stt": 90,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi CWP phát hiện không có tai nghe được kết nối, nó sẽ thông báo trên giao diện như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Bằng một tiếng còi lớn"
      },
      {
        "key": "b",
        "text": "Màn hình chuyển sang màu đen"
      },
      {
        "key": "c",
        "text": "Dòng chữ \"Headset not connected\" trên nền màu đỏ tại vùng thông báo hệ thống (System message area)"
      },
      {
        "key": "d",
        "text": "Biểu tượng tia chớp màu vàng"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-91",
    "stt": 91,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi nhấn nút \"CLEAN\", có thể hủy bỏ thời gian đếm ngược 15 giây sớm hơn được không?",
    "options": [
      {
        "key": "a",
        "text": "Không, phải đợi hết 15 giây đếm ngược"
      },
      {
        "key": "b",
        "text": "Có, bằng cách chạm 2 lần vào màn hình"
      },
      {
        "key": "c",
        "text": "Có, bằng cách nhấn phím nguồn"
      },
      {
        "key": "d",
        "text": "Có, bằng cách rút tai nghe"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-92",
    "stt": 92,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi thực hiện lệnh \"Reload\" (RLD) để nạp cấu hình mới, điều gì xảy ra với các cài đặt âm thanh (volume, routing) cá nhân hóa của kiểm soát viên?",
    "options": [
      {
        "key": "a",
        "text": "Chúng được lưu vĩnh viễn"
      },
      {
        "key": "b",
        "text": "Chúng được gửi lên máy chủ VCMS"
      },
      {
        "key": "c",
        "text": "Không bị ảnh hưởng, chỉ thay đổi danh bạ"
      },
      {
        "key": "d",
        "text": "Các cài đặt cá nhân hóa này có thể bị đặt lại (re-initialized) tùy thuộc vào cấu hình mặc định được tải về từ VCMS"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-93",
    "stt": 93,
    "category": "Khai thác đầu cuối CWP",
    "title": "\"Role\" (Vai trò) được định nghĩa như thế nào trong hệ thống VCS-4G?",
    "options": [
      {
        "key": "a",
        "text": "Là một máy chủ vật lý chứa các cổng giao tiếp"
      },
      {
        "key": "b",
        "text": "Là một vùng chứa logic (logical container) các tài nguyên cần thiết để kiểm soát một phân khu ATC (ATC sector)"
      },
      {
        "key": "c",
        "text": "Là thông tin đăng nhập của kiểm soát viên"
      },
      {
        "key": "d",
        "text": "Là thuật toán định tuyến cuộc gọi"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-94",
    "stt": 94,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khái niệm \"Mission\" (Nhiệm vụ) được định nghĩa là gì?",
    "options": [
      {
        "key": "a",
        "text": "Là tần số vô tuyến khẩn cấp"
      },
      {
        "key": "b",
        "text": "Là thực thể logic dùng để phân bổ các Role cho một kiểm soát viên và tạo bố cục nút bấm trên CWP"
      },
      {
        "key": "c",
        "text": "Là một nhiệm vụ yêu cầu kiểm soát viên không lưu thực hiện"
      },
      {
        "key": "d",
        "text": "Là danh sách các cuộc gọi nhỡ"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-95",
    "stt": 95,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong cơ chế \"Role Assignment\" (Gán Role), các Role được gán cho CWP theo phương thức nào?",
    "options": [
      {
        "key": "a",
        "text": "Gán tĩnh (statically assigned) thông qua hệ thống VCMS"
      },
      {
        "key": "b",
        "text": "Gán thủ công bởi kiểm soát viên trên màn hình GUI"
      },
      {
        "key": "c",
        "text": "Gán ngẫu nhiên khi CWP khởi động"
      },
      {
        "key": "d",
        "text": "Do máy bay tự động phân bổ"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-96",
    "stt": 96,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi một nút tần số vô tuyến ở chế độ \"Unselected\" (Không chọn), trạng thái của nó là gì?",
    "options": [
      {
        "key": "a",
        "text": "Cả nút RX và TX đều màu xanh"
      },
      {
        "key": "b",
        "text": "Cả nút RX và TX đều vô hiệu hóa (màu xám), KSV không thể nghe cũng như không thể phát trên tần số này"
      },
      {
        "key": "c",
        "text": "Bị khóa vĩnh viễn"
      },
      {
        "key": "d",
        "text": "Đang chuyển sang dự phòng"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-97",
    "stt": 97,
    "category": "Khai thác đầu cuối CWP",
    "title": "Ở chế độ \"Receive Mode\" (Chế độ Thu), trạng thái màu sắc trên nút là gì?",
    "options": [
      {
        "key": "a",
        "text": "TX màu xanh, RX màu xám"
      },
      {
        "key": "b",
        "text": "Cả RX và TX màu xanh"
      },
      {
        "key": "c",
        "text": "RX màu xanh dương nhạt (Light blue), TX màu xám. KSV nghe được nhưng nhấn PTT không phát đi"
      },
      {
        "key": "d",
        "text": "RX nhấp nháy đỏ"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-98",
    "stt": 98,
    "category": "Khai thác đầu cuối CWP",
    "title": "Chế độ \"Transmit Mode\" (Chế độ Phát) cho phép điều gì?",
    "options": [
      {
        "key": "a",
        "text": "TX màu xanh dương nhạt, RX màu xám. KSV không nghe được tín hiệu nhưng có thể phát đi khi bấm PTT"
      },
      {
        "key": "b",
        "text": "Vừa nghe vừa phát"
      },
      {
        "key": "c",
        "text": "Chặn mọi tín hiệu thu phát"
      },
      {
        "key": "d",
        "text": "Gọi điện thoại"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-99",
    "stt": 99,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong chế độ \"Traffic Mode\" (Chế độ Thu/Phát), nút tần số sẽ hiển thị như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Cả RX và TX đều màu xám"
      },
      {
        "key": "b",
        "text": "RX màu xanh, TX màu xám"
      },
      {
        "key": "c",
        "text": "Cả RX và TX đều được chọn (màu xanh dương nhạt)"
      },
      {
        "key": "d",
        "text": "Nhấp nháy màu vàng"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-100",
    "stt": 100,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút tần số có hiển thị \"viền màu cam\" (Orange border) xung quanh nút màu xanh báo hiệu điều gì?",
    "options": [
      {
        "key": "a",
        "text": "Kết nối thành công 100%"
      },
      {
        "key": "b",
        "text": "Tần số đang hoạt động nhưng có lỗi một phần (ít nhất một kênh bên trong bị rớt kết nối)"
      },
      {
        "key": "c",
        "text": "Tần số hoàn toàn tê liệt"
      },
      {
        "key": "d",
        "text": "Đang có báo cháy"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-101",
    "stt": 101,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút tài nguyên có \"viền màu đỏ\" (Red border) xung quanh báo hiệu điều gì?",
    "options": [
      {
        "key": "a",
        "text": "Bị lỗi hoàn toàn: không có kênh nào hoạt động, tài nguyên không thể dùng để thu/phát"
      },
      {
        "key": "b",
        "text": "Mất điện"
      },
      {
        "key": "c",
        "text": "Đang trong chế độ bảo mật"
      },
      {
        "key": "d",
        "text": "Pin yếu"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-102",
    "stt": 102,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tín hiệu Thu (Squelch) được biểu thị trên nút vô tuyến (đang chọn) như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Nút TX nhấp nháy đỏ"
      },
      {
        "key": "b",
        "text": "Nút RX nhấp nháy màu xanh/xám (blue/gray)"
      },
      {
        "key": "c",
        "text": "Nút RX đổi sang màu vàng"
      },
      {
        "key": "d",
        "text": "Biểu tượng loa xuất hiện"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-103",
    "stt": 103,
    "category": "Khai thác đầu cuối CWP",
    "title": "Khi một CWP khác đang phát (Remote PTT) trên cùng tần số, nút TX trên màn hình CWP của bạn sẽ hiển thị thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Không hiển thị gì"
      },
      {
        "key": "b",
        "text": "Bị khóa màu đen"
      },
      {
        "key": "c",
        "text": "Nhấp nháy màu Xanh lá cây (Green)"
      },
      {
        "key": "d",
        "text": "Báo lỗi đỏ"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-104",
    "stt": 104,
    "category": "Khai thác đầu cuối CWP",
    "title": "Có thể nhìn thấy CWP khác đang phát (Remote PTT) trên một tần số mà bạn đang KHÔNG CHỌN (Unselected) không?",
    "options": [
      {
        "key": "a",
        "text": "Có, một ô vuông nhỏ nhấp nháy màu xanh dương bên trong nút TX"
      },
      {
        "key": "b",
        "text": "Không thể"
      },
      {
        "key": "c",
        "text": "Có, nút TX sẽ tự động bật"
      },
      {
        "key": "d",
        "text": "Có, loa ngoài sẽ tự động kêu"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-105",
    "stt": 105,
    "category": "Khai thác đầu cuối CWP",
    "title": "Có thể chọn bao nhiêu nhãn vô tuyến ở chế độ \"Transmit\" cùng lúc?",
    "options": [
      {
        "key": "a",
        "text": "1"
      },
      {
        "key": "b",
        "text": "2"
      },
      {
        "key": "c",
        "text": "4"
      },
      {
        "key": "d",
        "text": "Nhiều nhãn, hệ thống sẽ phát đồng thời lên tất cả"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-106",
    "stt": 106,
    "category": "Khai thác đầu cuối CWP",
    "title": "Để chống lỗi kẹt phím PTT, hệ thống bảo vệ bằng cách nào?",
    "options": [
      {
        "key": "a",
        "text": "Yêu cầu nhập mật khẩu"
      },
      {
        "key": "b",
        "text": "Phát chuông cảnh báo"
      },
      {
        "key": "c",
        "text": "Cấu hình một thời gian Timeout, hết giờ hệ thống sẽ tự động ngắt PTT"
      },
      {
        "key": "d",
        "text": "Khởi động lại đài phát"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-107",
    "stt": 107,
    "category": "Khai thác đầu cuối CWP",
    "title": "BSS (Best Signal Selection / Receiver Voting) là tính năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Lọc tiếng ồn nền"
      },
      {
        "key": "b",
        "text": "Tự động giám sát và lựa chọn nguồn tín hiệu thu (máy thu) \"Tốt nhất\" từ nhiều máy thu đang cùng nghe một tần số"
      },
      {
        "key": "c",
        "text": "Ghi âm đài phát thanh"
      },
      {
        "key": "d",
        "text": "Tạo mật khẩu kết nối"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-108",
    "stt": 108,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong thuật ngữ vô tuyến, \"Side Tone\" nghĩa là gì?",
    "options": [
      {
        "key": "a",
        "text": "Nhạc chờ khi gọi điện"
      },
      {
        "key": "b",
        "text": "Tiếng ồn từ bên ngoài vọng vào"
      },
      {
        "key": "c",
        "text": "Phản hồi âm thanh giọng nói của chính KSV phát vào tai nghe của họ khi đang truyền sóng"
      },
      {
        "key": "d",
        "text": "Tiếng kêu bíp bíp của nút bấm"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-109",
    "stt": 109,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tính năng \"Unmonitored Frequency Prevention\" được thiết kế nhằm mục đích gì?",
    "options": [
      {
        "key": "a",
        "text": "Cảnh báo hoặc ngăn chặn việc KSV CWP cuối cùng bỏ nghe (bỏ RX) một tần số quan trọng, đảm bảo luôn có ít nhất 1 người giám sát tần số đó"
      },
      {
        "key": "b",
        "text": "Tắt màn hình khi không có ai nhìn"
      },
      {
        "key": "c",
        "text": "Tiết kiệm băng thông"
      },
      {
        "key": "d",
        "text": "Cấm thay đổi tần số"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-110",
    "stt": 110,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút chức năng \"HOLD\" dùng để làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Kết thúc cuộc gọi"
      },
      {
        "key": "b",
        "text": "Tạm dừng (treo) cuộc gọi đang diễn ra để rảnh tay làm việc khác, cuộc gọi bị treo sẽ nằm chờ trong Call Queue"
      },
      {
        "key": "c",
        "text": "Tăng âm lượng"
      },
      {
        "key": "d",
        "text": "Khóa màn hình"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-111",
    "stt": 111,
    "category": "Khai thác đầu cuối CWP",
    "title": "Tính năng \"FWD\" (Call Forward - Chuyển hướng cuộc gọi) cho phép làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Gửi lại file dữ liệu"
      },
      {
        "key": "b",
        "text": "Chuyển hướng các cuộc gọi ĐẾN sang một CWP, điện thoại SIP hoặc một đích đến khác"
      },
      {
        "key": "c",
        "text": "Chuyển hướng cuộc gọi ĐI"
      },
      {
        "key": "d",
        "text": "Tua nhanh ghi âm"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-112",
    "stt": 112,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nút \"PICKUP\" (Nhấc máy hộ) cho phép KSV làm gì?",
    "options": [
      {
        "key": "a",
        "text": "Tự động trả lời cuộc gọi"
      },
      {
        "key": "b",
        "text": "Mở khóa màn hình"
      },
      {
        "key": "c",
        "text": "Trả lời một cuộc gọi đang đổ chuông tại một CWP hoặc điện thoại SIP KHÁC nằm trong cùng một nhóm Pickup Group"
      },
      {
        "key": "d",
        "text": "Chuyển máy"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-113",
    "stt": 113,
    "category": "Khai thác đầu cuối CWP",
    "title": "Nhạc chuông báo cuộc gọi đến (Ringtone/Buzzer) có thể được tùy chỉnh thông qua menu nào?",
    "options": [
      {
        "key": "a",
        "text": "MORE -> RINGTONE"
      },
      {
        "key": "b",
        "text": "CFG -> CHAN"
      },
      {
        "key": "c",
        "text": "AUDIO -> ROUTING"
      },
      {
        "key": "d",
        "text": "TOOLS -> INFO"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-114",
    "stt": 114,
    "category": "Khai thác đầu cuối CWP",
    "title": "Trong menu AUDIO, nút \"BUZZER OFF\" có tác dụng gì?",
    "options": [
      {
        "key": "a",
        "text": "Tắt màn hình"
      },
      {
        "key": "b",
        "text": "Tắt tiếng loa ngoài"
      },
      {
        "key": "c",
        "text": "Tắt tiếng (Mute) âm thanh chuông báo cuộc gọi điện thoại đến, chỉ dựa vào cảnh báo chớp nháy bằng mắt"
      },
      {
        "key": "d",
        "text": "Tắt tiếng báo động khẩn cấp"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-115",
    "stt": 115,
    "category": "Khai thác đầu cuối CWP",
    "title": "Cài đặt nút \"BUZZER ONCE\" sẽ làm chuông điện thoại hoạt động như thế nào?",
    "options": [
      {
        "key": "a",
        "text": "Kêu liên tục không nghỉ"
      },
      {
        "key": "b",
        "text": "Chỉ phát tiếng \"Bíp\" MỘT LẦN DUY NHẤT cho mỗi cuộc gọi đến"
      },
      {
        "key": "c",
        "text": "Kêu mỗi giờ một lần"
      },
      {
        "key": "d",
        "text": "Chỉ rung không kêu"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-116",
    "stt": 116,
    "category": "Phần cứng",
    "title": "Thiết bị Radio Gateway hỗ trợ giao diện analog nào?",
    "options": [
      {
        "key": "a",
        "text": "FXO và FXS"
      },
      {
        "key": "b",
        "text": "ISDN BRI"
      },
      {
        "key": "c",
        "text": "E&M"
      },
      {
        "key": "d",
        "text": "E1"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-117",
    "stt": 117,
    "category": "Phần cứng",
    "title": "Card FXO có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Báo hiệu"
      },
      {
        "key": "b",
        "text": "Kết nối VCCS với tổng đài PBX hoặc card FXS bên ngoài"
      },
      {
        "key": "c",
        "text": "Kết nối VCCS với điện thoại ngoài"
      },
      {
        "key": "d",
        "text": "Kết nối VCCS với thiết bị ghi âm"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-118",
    "stt": 118,
    "category": "Phần cứng",
    "title": "Card FXS có chức năng gì?",
    "options": [
      {
        "key": "a",
        "text": "Báo hiệu"
      },
      {
        "key": "b",
        "text": "Kết nối VCCS với tổng đài"
      },
      {
        "key": "c",
        "text": "Kết nối VCCS với điện thoại hoặc card FXO bên ngoài"
      },
      {
        "key": "d",
        "text": "Kết nối VCCS với thiết bị ghi âm"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-119",
    "stt": 119,
    "category": "Phần cứng",
    "title": "Cách đấu nối nào sau đây là đúng?",
    "options": [
      {
        "key": "a",
        "text": "Micro, Loud Speaker nối vào các Audio box; các Audio box, TED nối vào CWP; các CWP, các NPT, các Gateway, VCMS Server nối vào SW"
      },
      {
        "key": "b",
        "text": "Micro, Loud Speaker, TED nối vào CWP; các CWP, các NPT, các Gateway, VCMS Server nối vào SW"
      },
      {
        "key": "c",
        "text": "Micro, Loud Speaker, TED nối vào CWP; các CWP nối vào VCMS Server; các NPT, các Gateway, VCMS Server nối vào SW"
      },
      {
        "key": "d",
        "text": "Tất cả các thành phần đều nối vào SW"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-120",
    "stt": 120,
    "category": "Phần cứng",
    "title": "Mỗi Audio Recorder box có bao nhiêu kênh ghi âm?",
    "options": [
      {
        "key": "a",
        "text": "1"
      },
      {
        "key": "b",
        "text": "2"
      },
      {
        "key": "c",
        "text": "3"
      },
      {
        "key": "d",
        "text": "4"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-121",
    "stt": 121,
    "category": "Phần cứng",
    "title": "Khi mất nguồn cung cấp DC1 của Telephony Gateway, tại mặt máy ta có thể nhận biết được không?",
    "options": [
      {
        "key": "a",
        "text": "Có, đèn DC1 tắt"
      },
      {
        "key": "b",
        "text": "Không, vì không có chỉ thị đèn"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-122",
    "stt": 122,
    "category": "Phần cứng",
    "title": "Các thiết bị VCCS-4G (Radio Server, các Gateway, các CWP) kết nối VCMS Server bằng",
    "options": [
      {
        "key": "a",
        "text": "01 kết nối Ethernet"
      },
      {
        "key": "b",
        "text": "02 kết nối Ethernet song song"
      },
      {
        "key": "c",
        "text": "03 kết nối Ethernet song song"
      },
      {
        "key": "d",
        "text": "04 kết nối Ethernet song song"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-123",
    "stt": 123,
    "category": "Phần cứng",
    "title": "Nếu không có nguồn đồng hồ chuẩn bên ngoài thì hệ thống VCCS-4G có hoạt động được không?",
    "options": [
      {
        "key": "a",
        "text": "Có"
      },
      {
        "key": "b",
        "text": "Không"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-124",
    "stt": 124,
    "category": "Phần cứng",
    "title": "VCCS-4G có thể kết nối với loại radio nào?",
    "options": [
      {
        "key": "a",
        "text": "Chỉ kết nối với radio của R&S"
      },
      {
        "key": "b",
        "text": "Radio IP bất kỳ"
      },
      {
        "key": "c",
        "text": "Radio Analog bất kỳ"
      },
      {
        "key": "d",
        "text": "Radio Analog bất kỳ hoặc các radio IP theo chuẩn ED137B"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-125",
    "stt": 125,
    "category": "Phần cứng",
    "title": "Cấu hình của toàn bộ hệ thống VCCS-4G được lưu trên",
    "options": [
      {
        "key": "a",
        "text": "CWP"
      },
      {
        "key": "b",
        "text": "VCMS Server"
      },
      {
        "key": "c",
        "text": "Radio Server"
      },
      {
        "key": "d",
        "text": "VCMS Server và các thiết bị VCCS (CWP, Gateway, Radio Server)"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-126",
    "stt": 126,
    "category": "Phần cứng",
    "title": "VCCS-4G là hệ thống để vận hành, điều khiển và quản lý các ứng dụng:",
    "options": [
      {
        "key": "a",
        "text": "Chỉ có các liên lạc thoại A/G giữa KSVKL và tàu bay"
      },
      {
        "key": "b",
        "text": "Gồm liên lạc thoại A/G giữa KSVKL với tàu bay và liên lạc G/G giữa KSVKL với các đơn vị nghiệp vụ khác"
      },
      {
        "key": "c",
        "text": "Gồm liên lạc thoại A/G giữa KSVKL với tàu bay, liên lạc G/G giữa KSVKL với nhau, KSVLK với các đơn vị nghiệp vụ khác."
      },
      {
        "key": "d",
        "text": "Gồm liên lạc thoại A/G giữa KSVKL với tàu bay, liên lạc G/G giữa KSVKL với nhau, KSVKL với các đơn vị nghiệp vụ khác và một số ứng dụng khác (IP camera, thiết bị SCADA…)"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-127",
    "stt": 127,
    "category": "Phần cứng",
    "title": "Telephony Gateway dùng để",
    "options": [
      {
        "key": "a",
        "text": "Kết nối giao diện thoại analog vào hệ thống VCS-4G"
      },
      {
        "key": "b",
        "text": "Kết nối kênh VHF IP vào hệ thống VCS-4G"
      },
      {
        "key": "c",
        "text": "Kết nối điện thoại IP vào hệ thống VCS-4G"
      },
      {
        "key": "d",
        "text": "Kết nối điện thoại analog và digital vào hệ thống VCS-4G"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-128",
    "stt": 128,
    "category": "Phần cứng",
    "title": "Khi hệ thống VCCS-4G đang hoạt động mà VCMS Server bị hỏng. Các thành phần còn lại của hệ thống VCCS-4G có tiếp tục hoạt động được không?",
    "options": [
      {
        "key": "a",
        "text": "Có"
      },
      {
        "key": "b",
        "text": "Không"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-129",
    "stt": 129,
    "category": "Cấu hình",
    "title": "Khái niệm \"Class\" trong cấu hình hệ thống là gì?\ne. Là một thành phần logic, dùng để nhóm nhiều port FXO lại với nhau",
    "options": [
      {
        "key": "a",
        "text": "Là một thành phần logic, dùng để nhóm nhiều port FXS lại với nhau"
      },
      {
        "key": "b",
        "text": "Là một thành phần logic, dùng để nhóm nhiều user hay port lại với nhau"
      },
      {
        "key": "c",
        "text": "Là một thành phần logic, dùng để nhóm nhiều user lại với nhau"
      },
      {
        "key": "d",
        "text": "Là một thành phần logic, dùng để nhóm nhiều port EM/Radio lại với nhau"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-130",
    "stt": 130,
    "category": "Cấu hình",
    "title": "1 CWP có thể có nhiều Role được không?",
    "options": [
      {
        "key": "a",
        "text": "Có"
      },
      {
        "key": "b",
        "text": "Không"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-131",
    "stt": 131,
    "category": "Cấu hình",
    "title": "Một Button (Vô tuyến hoặc Điện thoại) có thể được gán cho mấy Role?",
    "options": [
      {
        "key": "a",
        "text": "1 Role duy nhất"
      },
      {
        "key": "b",
        "text": "Không quá 2 Role"
      },
      {
        "key": "c",
        "text": "Nó có thể được gán vào NHIỀU Role cùng một lúc"
      },
      {
        "key": "d",
        "text": "Không cần gán vào Role nào"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-132",
    "stt": 132,
    "category": "Cấu hình",
    "title": "Hệ thống hỗ trợ những Class Types (Loại Class) chính nào?",
    "options": [
      {
        "key": "a",
        "text": "HTTP, FTP, SMTP"
      },
      {
        "key": "b",
        "text": "IP, TDM, USERS, Role Numbers"
      },
      {
        "key": "c",
        "text": "TCP, UDP, ICMP"
      },
      {
        "key": "d",
        "text": "LAN, WAN, WLAN"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-133",
    "stt": 133,
    "category": "Cấu hình",
    "title": "Các thiết bị CWP và FXS  thường được nhóm vào Class Type nào?",
    "options": [
      {
        "key": "a",
        "text": "IP"
      },
      {
        "key": "b",
        "text": "TDM"
      },
      {
        "key": "c",
        "text": "USERS"
      },
      {
        "key": "d",
        "text": "Role Numbers"
      }
    ],
    "answer": "c"
  },
  {
    "id": "q-134",
    "stt": 134,
    "category": "Cấu hình",
    "title": "Class Type \"TDM\" được gán cho loại thiết bị nào?",
    "options": [
      {
        "key": "a",
        "text": "Máy chủ VoIP"
      },
      {
        "key": "b",
        "text": "Các cổng vật lý trên Gateway như FXO, E&M"
      },
      {
        "key": "c",
        "text": "Điện thoại SIP"
      },
      {
        "key": "d",
        "text": "CWP"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-135",
    "stt": 135,
    "category": "Cấu hình",
    "title": "Khi tạo một User đại diện cho CWP, mục User Type (Loại người dùng) phải được chọn là gì?",
    "options": [
      {
        "key": "a",
        "text": "SIP"
      },
      {
        "key": "b",
        "text": "TDM"
      },
      {
        "key": "c",
        "text": "IP"
      },
      {
        "key": "d",
        "text": "CWP"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-136",
    "stt": 136,
    "category": "Cấu hình",
    "title": "Khi tạo một User đại diện cho Cổng thoại vật lý FXS, mục User Type phải được chọn là gì?",
    "options": [
      {
        "key": "a",
        "text": "TDM"
      },
      {
        "key": "b",
        "text": "SIP"
      },
      {
        "key": "c",
        "text": "IP"
      },
      {
        "key": "d",
        "text": "CWP"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-137",
    "stt": 137,
    "category": "Cấu hình",
    "title": "Khi thêm một kênh vô tuyến IP (VoIP Radio) vào hệ thống, ta phải tạo User Type là gì?",
    "options": [
      {
        "key": "a",
        "text": "SIP"
      },
      {
        "key": "b",
        "text": "TDM"
      },
      {
        "key": "c",
        "text": "CWP"
      },
      {
        "key": "d",
        "text": "IP"
      }
    ],
    "answer": "d"
  },
  {
    "id": "q-138",
    "stt": 138,
    "category": "Cấu hình",
    "title": "Một \"Role\" (Vai trò) trong VCS là gì?",
    "options": [
      {
        "key": "a",
        "text": "Tên đăng nhập của người dùng"
      },
      {
        "key": "b",
        "text": "Một tập hợp các nút Radio và Điện thoại được gán tới một hoặc một số CWP"
      },
      {
        "key": "c",
        "text": "Nút bấm trên bàn phím vật lý"
      },
      {
        "key": "d",
        "text": "Mã số trạm radar"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-139",
    "stt": 139,
    "category": "Cấu hình",
    "title": "Một Role có thể được gán cho một CWP thông qua đối tượng logic nào?",
    "options": [
      {
        "key": "a",
        "text": "Mission"
      },
      {
        "key": "b",
        "text": "Route"
      },
      {
        "key": "c",
        "text": "Class"
      },
      {
        "key": "d",
        "text": "Button"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-140",
    "stt": 140,
    "category": "Cấu hình",
    "title": "Để bắt đầu thêm các nút điện thoại hoặc vô tuyến vào một Role, bạn phải chọn Tab nào trong menu cấu hình của Role đó?",
    "options": [
      {
        "key": "a",
        "text": "Main"
      },
      {
        "key": "b",
        "text": "Operational Buttons"
      },
      {
        "key": "c",
        "text": "Audio"
      },
      {
        "key": "d",
        "text": "Rules"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-141",
    "stt": 141,
    "category": "Cấu hình",
    "title": "Cấu hình \"Buttons\" trong VCS được chia làm mấy loại chính?",
    "options": [
      {
        "key": "a",
        "text": "1 loại duy nhất"
      },
      {
        "key": "b",
        "text": "2 loại: Điện thoại (Telephony) và  Vô tuyến (Radio)"
      },
      {
        "key": "c",
        "text": "3 loại: Đỏ, Xanh, Vàng"
      },
      {
        "key": "d",
        "text": "4 loại"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-142",
    "stt": 142,
    "category": "Cấu hình",
    "title": "Để tạo một Radio Button, trường \"Type\" phải chọn là gì?",
    "options": [
      {
        "key": "a",
        "text": "Telephony"
      },
      {
        "key": "b",
        "text": "Rx/Tx"
      },
      {
        "key": "c",
        "text": "SIP"
      },
      {
        "key": "d",
        "text": "TDM"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-143",
    "stt": 143,
    "category": "Cấu hình",
    "title": "Để thêm các kênh Thu (Rx) và Phát (Tx) vào một Tần số đã tạo, bạn phải chọn Tab nào trong menu cấu hình Frequency?",
    "options": [
      {
        "key": "a",
        "text": "Main"
      },
      {
        "key": "b",
        "text": "Channels"
      },
      {
        "key": "c",
        "text": "Resources"
      },
      {
        "key": "d",
        "text": "Buttons"
      }
    ],
    "answer": "b"
  },
  {
    "id": "q-144",
    "stt": 144,
    "category": "Cấu hình",
    "title": "Sau khi một \"Frequency\" được tạo ra và gán đầy đủ các Channel, bước tiếp theo để nó hiện lên màn hình CWP là gì?",
    "options": [
      {
        "key": "a",
        "text": "Chọn Frequency đó gán vào một \"Radio Button\", sau đó gán Button đó vào một \"Role\""
      },
      {
        "key": "b",
        "text": "Khởi động lại CWP"
      },
      {
        "key": "c",
        "text": "Chỉ cần đợi 5 phút"
      },
      {
        "key": "d",
        "text": "Gán nó vào Telephony Resource"
      }
    ],
    "answer": "a"
  },
  {
    "id": "q-145",
    "stt": 145,
    "category": "Cấu hình",
    "title": "Tùy chọn \"Allow Tx Selection/Transmission\" khi gán Button vào Role có tác dụng gì?",
    "options": [
      {
        "key": "a",
        "text": "Khóa hoàn toàn chức năng phát của nút đó đối với Role này (KSV chỉ được nghe)"
      },
      {
        "key": "b",
        "text": "Bật phát loa ngoài"
      },
      {
        "key": "c",
        "text": "Nếu được chọn, KSV sở hữu Role này mới có quyền bấm chọn TX và phát PTT"
      },
      {
        "key": "d",
        "text": "Tạo kết nối chéo"
      }
    ],
    "answer": "c"
  }
];
